import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StatusIndicator } from '@/components/StatusIndicator';

interface InfoPanelProps {
  title?: string;
  linearX?: number;
  angularZ?: number;
  systemStatus?: 'connected' | 'connecting' | 'error';
  systemStatusMessage?: string;
  style?: ViewStyle;
}

export function InfoPanel({ 
  title = 'Robot Kontrol Paneli', 
  linearX = 0, 
  angularZ = 0, 
  systemStatus = 'connecting',
  systemStatusMessage = 'Bağlanıyor...',
  style 
}: InfoPanelProps) {
  return (
    <ThemedView style={[styles.container, style]}>
      <ThemedText type="subtitle">{title}</ThemedText>
      
      <ThemedView style={styles.valueContainer}>
        <ThemedText>Linear X: <ThemedText type="defaultSemiBold">{linearX.toFixed(2)}</ThemedText></ThemedText>
        <ThemedText>Angular Z: <ThemedText type="defaultSemiBold">{angularZ.toFixed(2)}</ThemedText></ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.statusContainer}>
        <ThemedText>Sistem Durumu: </ThemedText>
        <StatusIndicator 
          status={systemStatus} 
          message={systemStatusMessage} 
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  valueContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});
