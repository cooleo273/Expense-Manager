import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { LayoutRectangle, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Portal } from 'react-native-paper';

import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Colors, IconSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type InfoTooltipProps = {
  content: string;
  iconColor?: string;
  size?: number;
  testID?: string;
};

type AnchorRect = LayoutRectangle | null;

export function InfoTooltip({ content, iconColor, size = IconSizes.md, testID }: InfoTooltipProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState<AnchorRect>(null);
  const iconRef = useRef<View>(null);
  const window = useWindowDimensions();

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  const show = useCallback(() => {
    if (iconRef.current) {
      iconRef.current.measureInWindow((x, y, width, height) => {
        setAnchor({ x, y, width, height });
        setVisible(true);
      });
    } else {
      setVisible(true);
    }
  }, []);

  const tooltipPosition = useMemo(() => {
    if (!anchor) {
      return {
        top: window.height * 0.35,
        left: Math.max(Spacing.lg, (window.width - TOOLTIP_WIDTH) / 2),
      };
    }

    const preferredTop = anchor.y - TOOLTIP_HEIGHT - Spacing.sm;
    const top = Math.max(Spacing.sm, preferredTop);
    const centeredLeft = anchor.x + anchor.width / 2 - TOOLTIP_WIDTH / 2;
    const left = Math.min(
      window.width - TOOLTIP_WIDTH - Spacing.sm,
      Math.max(Spacing.sm, centeredLeft),
    );

    return { top, left };
  }, [anchor, window.height, window.width]);

  return (
    <>
      <Pressable
        ref={iconRef}
        accessibilityRole="button"
        accessibilityHint="Show full value"
        onPress={visible ? hide : show}
        onHoverIn={() => show()}
        onHoverOut={hide}
        style={styles.iconButton}
        testID={testID}
      >
        <MaterialCommunityIcons name="help-circle-outline" size={size} color={iconColor ?? palette.icon} />
      </Pressable>
      {visible ? (
        <Portal>
          <Pressable style={styles.backdrop} onPress={hide} testID={testID ? `${testID}-tooltip-backdrop` : undefined}>
            <View
              style={[
                styles.tooltip,
                tooltipPosition,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <ThemedText style={[styles.tooltipText, { color: palette.text }]}>{content}</ThemedText>
            </View>
          </Pressable>
        </Portal>
      ) : null}
    </>
  );
}

const TOOLTIP_WIDTH = 180;
const TOOLTIP_HEIGHT = 48;

const styles = StyleSheet.create({
  iconButton: {
    padding: Spacing.tiny,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  tooltip: {
    position: 'absolute',
    width: TOOLTIP_WIDTH,
    minHeight: TOOLTIP_HEIGHT,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  tooltipText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
