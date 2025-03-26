import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Image, SafeAreaView, ScrollView, Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';

import { CameraView } from '@/components/CameraView';
import { ErrorScreen } from '@/components/ErrorScreen';
import { InfoPanel } from '@/components/InfoPanel';
import { Joystick } from '@/components/Joystick';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// API URL
const API_URL = 'http://localhost:5000';

export default function RobotControlScreen() {
  // Durum değişkenleri
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('Sistem başlatılıyor...');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [linearX, setLinearX] = useState(0);
  const [angularZ, setAngularZ] = useState(0);
  const [systemStatus, setSystemStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [systemStatusMessage, setSystemStatusMessage] = useState('Bağlanıyor...');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [connectionStatusMessage, setConnectionStatusMessage] = useState('Bağlantı Bekleniyor');
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  
  // Socket.io bağlantısı
  const socketRef = useRef<Socket | null>(null);
  const connectionRetriesRef = useRef(0);
  const MAX_RETRIES = 5;
  
  // API bağlantısı
  useEffect(() => {
    // Yükleme ekranını göster
    setIsLoading(true);
    setLoadingStatus('Sistem durumu kontrol ediliyor...');
    
    // Sistem durumunu kontrol et
    checkSystemStatus();
    
    // Temizleme fonksiyonu
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);
  
  // Sistem durumunu kontrol etme fonksiyonu
  const checkSystemStatus = async () => {
    try {
      // Sistem durumunu al
      const response = await fetch(`${API_URL}/status`);
      
      if (!response.ok) {
        throw new Error('Sunucu yanıt vermiyor');
      }
      
      const data = await response.json();
      
      if (data.ros_initialized) {
        setLoadingStatus('ROS2 başlatıldı, bağlantı bekleniyor...');
        
        if (data.ros_connected) {
          // ROS bağlantısı kuruldu, Socket.IO bağlantısını başlat
          setLoadingStatus('Bağlantı kuruldu, WebSocket başlatılıyor...');
          initializeSocketIO();
        } else {
          // ROS başlatıldı ama henüz bağlantı yok, tekrar kontrol et
          connectionRetriesRef.current++;
          if (connectionRetriesRef.current < MAX_RETRIES) {
            setTimeout(checkSystemStatus, 3000);
          } else {
            handleConnectionError('ROS2 bağlantısı kurulamadı. Lütfen robot bağlantısını kontrol edin.');
          }
        }
      } else {
        // ROS başlatılamadı, tekrar dene
        connectionRetriesRef.current++;
        if (connectionRetriesRef.current < MAX_RETRIES) {
          setLoadingStatus(`ROS2 başlatılamadı, yeniden deneniyor (${connectionRetriesRef.current}/${MAX_RETRIES})...`);
          setTimeout(checkSystemStatus, 3000);
        } else {
          handleConnectionError('ROS2 başlatılamadı. Lütfen sistem durumunu kontrol edin.');
        }
      }
    } catch (error) {
      console.error('Durum kontrolü hatası:', error);
      connectionRetriesRef.current++;
      if (connectionRetriesRef.current < MAX_RETRIES) {
        setLoadingStatus(`Bağlantı hatası, yeniden deneniyor (${connectionRetriesRef.current}/${MAX_RETRIES})...`);
        setTimeout(checkSystemStatus, 3000);
      } else {
        handleConnectionError('Sunucuya bağlanılamadı. Lütfen uygulamanın çalıştığından emin olun.');
      }
    }
  };
  
  // Socket.IO bağlantısını başlatma
  const initializeSocketIO = () => {
    try {
      // Socket.IO bağlantısı oluştur
      socketRef.current = io(API_URL);
      
      // Bağlantı olayları
      socketRef.current.on('connect', () => {
        console.log('WebSocket bağlantısı kuruldu');
        setLoadingStatus('WebSocket bağlantısı kuruldu, uygulama başlatılıyor...');
        
        // Bağlantı kuruldu, uygulamayı başlat
        setTimeout(() => {
          setIsLoading(false);
          setSystemStatus('connected');
          setSystemStatusMessage('Bağlı');
          setConnectionStatus('connected');
          setConnectionStatusMessage('Bağlı');
        }, 500);
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('WebSocket bağlantısı kesildi');
        setConnectionStatus('error');
        setConnectionStatusMessage('Bağlantı Kesildi');
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket bağlantı hatası:', error);
        connectionRetriesRef.current++;
        if (connectionRetriesRef.current < MAX_RETRIES) {
          setLoadingStatus(`WebSocket bağlantı hatası, yeniden deneniyor (${connectionRetriesRef.current}/${MAX_RETRIES})...`);
        } else {
          handleConnectionError('WebSocket bağlantısı kurulamadı. Lütfen sunucuyu kontrol edin.');
        }
      });
      
      // Kamera görüntüsü olayı
      socketRef.current.on('camera_frame', (data) => {
        if (data.image) {
          setCameraImage(`data:image/jpeg;base64,${data.image}`);
          setConnectionStatus('connected');
          setConnectionStatusMessage(`Bağlı (${fps} FPS)`);
          
          // FPS hesaplama
          setFps((prevFps) => {
            // Basit bir FPS hesaplama, gerçek uygulamada daha karmaşık olabilir
            return prevFps === 0 ? 10 : prevFps;
          });
        }
      });
      
      // Durum bilgisi olayı
      socketRef.current.on('status', (data) => {
        updateSystemStatusFromData(data);
      });
    } catch (error) {
      console.error('Socket.IO başlatma hatası:', error);
      handleConnectionError('WebSocket bağlantısı başlatılamadı.');
    }
  };
  
  // Sistem durumunu veri ile güncelleme
  const updateSystemStatusFromData = (data: any) => {
    if (data.ros_connected) {
      setSystemStatus('connected');
      setSystemStatusMessage('Bağlı');
    } else if (data.ros_initialized) {
      setSystemStatus('connecting');
      setSystemStatusMessage('Başlatıldı, Bağlanıyor...');
    } else {
      setSystemStatus('error');
      setSystemStatusMessage('Bağlantı Hatası');
    }
  };
  
  // Bağlantı hatası işleme
  const handleConnectionError = (message: string) => {
    setIsLoading(false);
    setIsError(true);
    setErrorMessage(message);
    setSystemStatus('error');
    setSystemStatusMessage('Bağlantı Hatası');
    setConnectionStatus('error');
    setConnectionStatusMessage('Bağlantı Yok');
  };

  // Joystick hareket işleyicisi
  const handleJoystickMove = (x: number, y: number) => {
    setLinearX(y);  // İleri/geri hareket
    setAngularZ(x); // Dönüş hareketi
    
    // Socket.IO üzerinden hareket komutlarını gönder
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('cmd_vel', { 
        linear_x: y, 
        angular_z: x 
      }, (response: any) => {
        if (response && response.status === 'success') {
          // Başarılı komut gönderimi
          if (connectionStatus !== 'connected') {
            setConnectionStatus('connected');
            setConnectionStatusMessage('Bağlı');
          }
        } else {
          // Hata durumu
          console.error('Hız komutu gönderilemedi:', response ? response.message : 'Bilinmeyen hata');
          if (connectionStatus !== 'error') {
            setConnectionStatus('error');
            setConnectionStatusMessage('Komut Hatası');
          }
        }
      });
    } else {
      console.error('WebSocket bağlantısı yok, komut gönderilemedi');
      if (connectionStatus !== 'error') {
        setConnectionStatus('error');
        setConnectionStatusMessage('Bağlantı Yok');
      }
    }
  };

  // Joystick bırakma işleyicisi
  const handleJoystickRelease = () => {
    setLinearX(0);
    setAngularZ(0);
    
    // Socket.IO üzerinden durma komutunu gönder
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('cmd_vel', { 
        linear_x: 0, 
        angular_z: 0 
      });
    }
  };

  // Yeniden deneme işleyicisi
  const handleRetry = () => {
    setIsError(false);
    setIsLoading(true);
    setLoadingStatus('Yeniden bağlanılıyor...');
    connectionRetriesRef.current = 0;
    
    // Socket.IO bağlantısını kapat
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    // Sistem durumunu tekrar kontrol et
    checkSystemStatus();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.mainContent}>
          {/* Kamera Görüntüsü */}
          <CameraView
            source={cameraImage ? cameraImage : undefined}
            connectionStatus={connectionStatus}
            statusMessage={connectionStatusMessage}
            style={styles.cameraContainer}
          />
          
          {/* Kontrol Paneli */}
          <ThemedView style={styles.controlContainer}>
            {/* Joystick */}
            <Joystick 
              size={180} 
              onMove={handleJoystickMove} 
              onRelease={handleJoystickRelease}
              style={styles.joystick}
            />
            
            {/* Bilgi Paneli */}
            <InfoPanel
              linearX={linearX}
              angularZ={angularZ}
              systemStatus={systemStatus}
              systemStatusMessage={systemStatusMessage}
              style={styles.infoPanel}
            />
          </ThemedView>
        </ThemedView>
      </ScrollView>
      
      {/* Yükleme Ekranı */}
      <LoadingScreen 
        visible={isLoading} 
        message="Sistem başlatılıyor..." 
        status={loadingStatus} 
      />
      
      {/* Hata Ekranı */}
      <ErrorScreen 
        visible={isError} 
        message={errorMessage} 
        onRetry={handleRetry} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraContainer: {
    height: 300,
  },
  controlContainer: {
    padding: 20,
    alignItems: 'center',
  },
  joystick: {
    marginBottom: 20,
  },
  infoPanel: {
    width: '100%',
  },
});
