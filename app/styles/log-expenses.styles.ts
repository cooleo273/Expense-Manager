import { BorderRadius, FontWeights, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const logExpensesStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: FontWeights.semibold as any,
  },
  form: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  scanButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  saveButton: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: FontWeights.semibold as any,
  },
  entryCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});