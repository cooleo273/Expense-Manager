import { BorderRadius, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const statisticsStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  chart: {
    borderRadius: BorderRadius.lg,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: Spacing.md,
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.sm,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  compareLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  categorySwatch: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
  },
  categoryLabel: {
    flex: 1,
  },
});