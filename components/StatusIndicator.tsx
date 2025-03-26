import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type StatusType = 'connected' | 'connecting' | 'error';

interface StatusIndicatorProps {
  status: StatusType;
  message: string;
  style?: ViewStyle;
}

export function StatusIndicator({ status, message, style }: StatusIndicatorProps) {
  // Status renklerini belirle
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#2ecc71'; // Yeşil
      case 'connecting':
        return '#f39c12'; // Turuncu
      case 'error':
        return '#e74c3c'; // Kırmızı
      default:
        return '#9BA1A6'; // Varsayılan gri
    }
  };

  return (
    <ThemedView style={[styles.container, style]}>
      <ThemedText style={[styles.text, { color: getStatusColor() }]}>
        {message}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
