import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ToastTone = 'default' | 'success' | 'error' | 'warning';

type ToastProps = {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  tone?: ToastTone;
};

export const Toast: React.FC<ToastProps> = ({ message, visible, onHide, duration = 3000, tone = 'default' }) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(100)).current;
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const backgroundColor = useMemo(() => {
    switch (tone) {
      case 'error':
        return palette.error;
      case 'success':
        return palette.success;
      case 'warning':
        return palette.warning;
      default:
        return 'rgba(15, 23, 42, 0.9)';
    }
  }, [palette.error, palette.success, palette.warning, tone]);

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
      <View style={[styles.toast, { backgroundColor }]}
      >
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