import { Spacing } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const getCustomHeaderStyles = (palette: any) => StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
        backgroundColor: palette.card,
    borderBottomWidth: 1, 
        borderBottomColor: palette.border,
    shadowColor: '#000',
    shadowOffset: { 
        width: 0, 
        height: -5
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});