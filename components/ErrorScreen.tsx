import React from 'react';
import { StyleSheet, TouchableOpacity, Modal, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ErrorScreenProps {
  visible: boolean;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorScreen({ 
  visible, 
  message = 'Bağlantı hatası oluştu.', 
  onRetry,
  style 
}: ErrorScreenProps) {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <ThemedView style={[styles.container, style]}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>Bağlantı Hatası</ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>
          
          {onRetry && (
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: tintColor }]} 
              onPress={onRetry}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.buttonText}>Yeniden Dene</ThemedText>
            </TouchableOpacity>
          )}
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
    maxWidth: '80%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#e74c3c',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
