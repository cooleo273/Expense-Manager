import { BorderRadius, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    position: 'relative',
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.lg,
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
    gap: Spacing.xs,
    maxWidth: '60%',
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  balanceLabel: {
    fontSize: FontSizes.lg,
    color: '#6B7280',
    marginBottom: 0,
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  balanceValue: {
    fontSize: FontSizes.huge,
    fontWeight: FontWeights.bold as any,
    lineHeight: FontSizes.huge + 4,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.tiny,
    paddingHorizontal: Spacing.md,
    borderWidth: 0,
  },
  metaValue: {
    fontWeight: FontWeights.semibold as any,
    fontSize: FontSizes.md,
  },
  metaValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.tiny,
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
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  recordDivider: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.7,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginTop: 0,
    fontSize: FontSizes.xs,
  },
  recordMeta: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  recordAmount: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold as any,
  },
  fabMain: {
    borderRadius: BorderRadius.round,
    ...Shadows.heavy,
  },
  fabGroupContainer: {
    position: 'absolute',
    right: Spacing.xl,
  },
  fabBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,12,20,0.85)',
  },
});