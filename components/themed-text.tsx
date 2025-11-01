import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontSizes, FontWeights } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  defaultSemiBold: {
    fontSize: FontSizes.md,
    lineHeight: 22,
    fontWeight: FontWeights.semibold as any,
  },
  title: {
    fontSize: FontSizes.massive,
    fontWeight: FontWeights.bold as any,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold as any,
  },
  link: {
    lineHeight: 26,
    fontSize: FontSizes.md,
    color: '#0a7ea4',
  },
});
