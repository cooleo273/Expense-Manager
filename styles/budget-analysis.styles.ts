import { BorderRadius, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const budgetAnalysisStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    height: 8,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(148,163,184,0.25)',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.round,
  },
});