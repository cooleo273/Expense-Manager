import { BorderRadius, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { Platform, StyleSheet } from 'react-native';

export const tabLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    height: 68,
    borderRadius: 0,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 0,
    zIndex: 100,
    ...Shadows.tabBar,
    ...(Platform.OS === 'web'
      ? {
          position: 'relative',
          width: '100%',
        }
      : {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        }),
  },
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.xl,
  },
  tabLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
    marginTop: Spacing.xs,
  },
  tabIcon: {
    marginBottom: 0,
  },
});