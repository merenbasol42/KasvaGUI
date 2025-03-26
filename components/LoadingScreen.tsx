import React from 'react';
import { StyleSheet, ActivityIndicator, Modal, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface LoadingScreenProps {
  visible: boolean;
  message?: string;
  status?: string;
  style?: ViewStyle;
}

export function LoadingScreen({ 
  visible, 
  message = 'Sistem başlatılıyor...', 
  status = 'Bağlantı bekleniyor...',
  style 
}: LoadingScreenProps) {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <ThemedView style={[styles.container, style]}>
        <ThemedView style={styles.content}>
          <ActivityIndicator size="large" color={tintColor} style={styles.spinner} />
          <ThemedText style={styles.message}>{message}</ThemedText>
          <ThemedText style={styles.status}>{status}</ThemedText>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
  },
});
