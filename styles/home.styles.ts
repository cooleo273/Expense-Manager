import { BorderRadius, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    position: 'relative',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceCard: {
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSide: {
    flexDirection: 'column',
    gap: Spacing.md,
  },
  balanceLabel: {
    fontSize: FontSizes.lg,
    color: '#6B7280',
    marginBottom: Spacing.sm,
  },
  balanceValue: {
    fontSize: FontSizes.massive,
    fontWeight: FontWeights.bold as any,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  metaValue: {
    fontWeight: FontWeights.semibold as any,
    fontSize: FontSizes.md,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  chartRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'center',
  },
  legendContainer: {
    flex: 1,
    gap: Spacing.md,
    flexShrink: 1,
    minWidth: 140,
  },
  separator: {
    height: 1,
    marginVertical: Spacing.md,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  chartCenterValue: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold as any,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: BorderRadius.sm,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordContent: {
    flex: 1,
  },
  recordTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as any,
  },
  recordSubtitle: {
    marginTop: Spacing.xs,
    fontSize: FontSizes.md,
  },
  recordMeta: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  recordAmount: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold as any,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 60,
    height: 60,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.heavy,
    zIndex: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabOption: {
    position: 'absolute',
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    backgroundColor: 'rgba(0,0,0,0.7)',
    ...Shadows.medium,
  },
});