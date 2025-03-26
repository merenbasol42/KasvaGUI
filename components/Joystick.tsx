import React, { useRef, useState } from 'react';
import { StyleSheet, View, PanResponder, Animated, ViewStyle } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface JoystickProps {
  size?: number;
  onMove?: (x: number, y: number) => void;
  onRelease?: () => void;
  style?: ViewStyle;
}

export function Joystick({ 
  size = 200, 
  onMove, 
  onRelease,
  style 
}: JoystickProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  const knobSize = size / 3;
  const maxDistance = (size - knobSize) / 2;
  
  const pan = useRef(new Animated.ValueXY()).current;
  const [active, setActive] = useState(false);

  const calculateVelocity = (x: number, y: number) => {
    // Normalize values between -1 and 1
    const normalizedX = x / maxDistance;
    const normalizedY = -y / maxDistance; // Invert Y for intuitive control
    
    // Clamp values
    const clampedX = Math.min(1, Math.max(-1, normalizedX));
    const clampedY = Math.min(1, Math.max(-1, normalizedY));
    
    return { x: clampedX, y: clampedY };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setActive(true);
        // Offset değerlerini ayarlamak yerine sadece pozisyonu sıfırlayalım
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        // Calculate distance from center
        const distance = Math.sqrt(gesture.dx * gesture.dx + gesture.dy * gesture.dy);
        
        // If distance exceeds maxDistance, normalize the coordinates
        if (distance > maxDistance) {
          const angle = Math.atan2(gesture.dy, gesture.dx);
          gesture.dx = Math.cos(angle) * maxDistance;
          gesture.dy = Math.sin(angle) * maxDistance;
        }
        
        pan.setValue({ x: gesture.dx, y: gesture.dy });
        
        if (onMove) {
          const velocity = calculateVelocity(gesture.dx, gesture.dy);
          onMove(velocity.x, velocity.y);
        }
      },
      onPanResponderRelease: () => {
        setActive(false);
        pan.flattenOffset();
        
        // Reset position with animation
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 5,
        }).start();
        
        if (onRelease) {
          onRelease();
        }
      },
    })
  ).current;

  return (
    <ThemedView 
      style={[
        styles.container, 
        { width: size, height: size, borderRadius: size / 2 },
        style
      ]}
    >
      <View style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.knob,
            {
              width: knobSize,
              height: knobSize,
              borderRadius: knobSize / 2,
              backgroundColor: active ? tintColor : '#3498db',
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  base: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  knob: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
