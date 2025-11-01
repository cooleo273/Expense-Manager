import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const statisticsStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  toolbarTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold as any,
  },
  calendarButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chart: {
    borderRadius: BorderRadius.lg,
  },
  barSummaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  barSummaryBlock: {
    flex: 1,
    minWidth: '45%',
    gap: Spacing.xs,
  },
  summaryLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium as any,
    letterSpacing: 0.4,
  },
  summaryValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold as any,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  donutValue: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold as any,
  },
  donutCaption: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium as any,
    letterSpacing: 0.4,
  },
  legendColumn: {
    flex: 1,
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  legendSwatch: {
    width: 16,
    height: 16,
    borderRadius: BorderRadius.sm,
  },
  legendText: {
    flex: 1,
    gap: Spacing.xs,
  },
  legendAmount: {
    fontSize: FontSizes.sm,
  },
  legendPercent: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
  },
});