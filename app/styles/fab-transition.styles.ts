import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const fabTransitionStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  bottomSheetContent: {
    flex: 1,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transferButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  redWipe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#D91C1C',
  },
});