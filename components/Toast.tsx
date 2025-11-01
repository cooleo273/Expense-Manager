import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';

type ToastProps = {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
};

export const Toast: React.FC<ToastProps> = ({ message, visible, onHide, duration = 3000 }) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(100)).current;

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [fadeAnim, translateY, onHide]);

  useEffect(() => {
    if (visible) {
      // Show toast
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, hideToast, fadeAnim, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          bottom: insets.bottom + 20,
        },
      ]}
    >
      <View style={styles.toast}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.xl,
    right: Spacing.xl,
    zIndex: 1000,
  },
  toast: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.medium,
  },
  message: {
    color: 'white',
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium as any,
    textAlign: 'center',
  },
});