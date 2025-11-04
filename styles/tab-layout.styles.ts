import { BorderRadius, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const tabLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 68,
    borderRadius: 0,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 0,
    ...Shadows.tabBar,
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