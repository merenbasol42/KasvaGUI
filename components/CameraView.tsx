import React from 'react';
import { StyleSheet, Image, ImageSourcePropType, ViewStyle } from 'react-native';

import { StatusIndicator } from '@/components/StatusIndicator';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface CameraViewProps {
  source?: ImageSourcePropType | string;
  connectionStatus?: 'connected' | 'connecting' | 'error';
  statusMessage?: string;
  style?: ViewStyle;
}

export function CameraView({ 
  source, 
  connectionStatus = 'connecting', 
  statusMessage = 'Bağlantı Bekleniyor', 
  style 
}: CameraViewProps) {
  return (
    <ThemedView style={[styles.container, style]}>
      {source ? (
        <Image 
          source={typeof source === 'string' ? { uri: source } : source} 
          style={styles.cameraFeed} 
          resizeMode="contain"
        />
      ) : (
        <ThemedView style={styles.noFeed}>
          <ThemedText style={styles.noFeedText}>Kamera görüntüsü yok</ThemedText>
        </ThemedView>
      )}
      
      <StatusIndicator 
        status={connectionStatus}
        message={statusMessage}
        style={styles.statusIndicator}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraFeed: {
    width: '100%',
    height: '100%',
  },
  statusIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  noFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFeedText: {
    color: '#fff',
    fontSize: 16,
  },
});
