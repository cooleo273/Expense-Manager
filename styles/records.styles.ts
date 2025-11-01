import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const recordsStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  header: {
    gap: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FontSizes.huge,
    fontWeight: FontWeights.bold as any,
  },
  headerButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
    letterSpacing: 0.6,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    gap: Spacing.sm,
  },
  itemTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as any,
  },
  itemSubtitle: {
    fontSize: FontSizes.md,
  },
  itemNote: {
    fontSize: FontSizes.sm,
  },
  itemMeta: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  itemAmount: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold as any,
  },
  itemDate: {
    fontSize: FontSizes.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalBackdrop: {
    flex: 1,
  },
  filterSheet: {
    width: '78%',
    borderTopLeftRadius: BorderRadius.xxl,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  filterTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold as any,
  },
  filterContent: {
    gap: Spacing.md,
  },
  filterRowItem: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterRowText: {
    flex: 1,
    gap: Spacing.sm,
  },
  filterRowTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as any,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  modalChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  modalChipLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
    letterSpacing: 0.6,
  },
  applyButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});