import { BorderRadius, FontSizes, FontWeights, Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const logExpensesStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardWrapper: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  accountText: {
    fontWeight: FontWeights.semibold as any,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  addListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  addListLabel: {
    fontWeight: FontWeights.semibold as any,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium as any,
    letterSpacing: 0.4,
  },
  amountLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold as any,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  currencySymbol: {
    fontSize: FontSizes.massive,
    fontWeight: FontWeights.bold as any,
  },
  amountInput: {
    flex: 1,
    fontSize: FontSizes.massive,
    fontWeight: FontWeights.bold as any,
    padding: 0,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  batchSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  cameraButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batchTotal: {
    fontSize: FontSizes.huge,
    fontWeight: FontWeights.bold as any,
  },
  batchList: {
    gap: Spacing.md,
  },
  batchCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  batchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  batchTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as any,
  },
  removeButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  batchInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  batchField: {
    flex: 1,
    minWidth: 140,
  },
  batchAmountInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignSelf: 'center', // Changed from 'flex-end' to 'center'
  },
  addRecordText: {
    fontWeight: FontWeights.semibold as any,
  },
  savedSummary: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
    padding: Spacing.lg,
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  menuLabel: {
    fontWeight: FontWeights.medium as any,
  },
});