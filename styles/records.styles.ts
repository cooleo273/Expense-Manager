import { BorderRadius, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
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
  recordsCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
    overflow: 'hidden',
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
    paddingHorizontal: Spacing.md,
  },
  chipWrapper: {
    flexGrow: 0,
    flexShrink: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignSelf: 'flex-start',
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
  sortContainer: {
    position: 'relative',
  },
  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  itemContainer: {
    backgroundColor: 'transparent',
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
    gap: 0,
  },
  itemTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as any,
  },
  itemSubtitle: {
    fontSize: FontSizes.xs,
  },
  itemNote: {
    fontSize: FontSizes.xs,
  },
  itemMeta: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  itemAmount: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold as any,
  },
  itemDate: {
    fontSize: FontSizes.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  listSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.lg,
    marginRight: Spacing.lg,
  },
  calendarPresetList: {
    gap: Spacing.md,
  },
  presetButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  presetButtonText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium as any,
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
  },
  filterRowItem: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterRowActive: {
    borderWidth: 1,
    // color will be applied inline from palette
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
    borderRadius: 0,
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
  menuOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sortDropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 160,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
    zIndex: 9999,
    ...Shadows.medium,
  },
  sortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    backgroundColor: '#ffffff',
    zIndex: 9999,
  },
  sortTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as any,
    marginBottom: Spacing.sm,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: '#ffffff',
  },
  sortOptionText: {
    fontSize: FontSizes.md,
  },
  calendarSheet: {
    width: '78%',
    borderTopLeftRadius: BorderRadius.xxl,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderWidth: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  calendarTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold as any,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  monthTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as any,
  },
  weekDayHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium as any,
  },
  calendarGrid: {
    gap: Spacing.xs,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    margin: 1,
  },
  dayText: {
    fontSize: FontSizes.md,
  },
  fabBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,12,20,0.85)',
  },
  fabGroupContainer: {
    position: 'absolute',
    right: Spacing.xl,
  },
  fabMain: {
    borderRadius: BorderRadius.round,
    ...Shadows.heavy,
  },
});