import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { FlatList, TouchableOpacity, View, ViewStyle } from 'react-native';


import { ThemedText } from '@/components/themed-text';
import { getCategoryColor, getCategoryIcon, getNodeDisplayName } from '@/constants/categories';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { homeStyles } from '@/styles/home.styles';
import { recordsStyles } from '@/styles/records.styles';
import { formatFriendlyDate } from '@/utils/date';


type RecordListProps = {
  records: any[];
  limit?: number;
  style?: ViewStyle;
  onPressItem?: (item: any) => void;
  formatCurrency?: (value: number, type?: 'income' | 'expense') => string;
  /** Variant controls which row styles to use (home or records) */
  variant?: 'home' | 'records';
  /** Extra padding at the bottom for safe area or tab bar */
  bottomInset?: number;
};


export default function RecordList({ records, limit, style, onPressItem, formatCurrency, variant = 'records', bottomInset = 0 }: RecordListProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];


  const data = limit && records.length > limit ? records.slice(0, limit) : records;


  return (
    <FlatList
      style={variant === 'records' ? [{ flex: 1 }, style] : style}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const isLast = index === data.length - 1;
        const amountColor = item.type === 'income' ? palette.success : palette.error;
        const categoryColor = getCategoryColor(item.categoryId, palette.tint);
        const iconName = getCategoryIcon(item.categoryId, item.type === 'income' ? 'wallet-plus' : 'shape-outline');
        const itemDate: Date = item.date instanceof Date ? item.date : new Date(item.date);
        // Choose styles based on the requested variant
        if (variant === 'records') {
          return (
            <TouchableOpacity onPress={() => onPressItem?.(item)} style={recordsStyles.itemContainer}>
              <View style={recordsStyles.itemRow}>
                <View style={[recordsStyles.iconBadge, { backgroundColor: `${categoryColor}15` }]}>
                  <MaterialCommunityIcons name={iconName as any} size={20} color={categoryColor} />
                </View>
                <View style={recordsStyles.itemContent}>
                  <ThemedText style={[recordsStyles.itemTitle, { color: palette.text }]}>{getNodeDisplayName(item.subcategoryId) ?? getNodeDisplayName(item.categoryId) ?? item.title}</ThemedText>
                  <ThemedText style={[recordsStyles.itemSubtitle, { color: palette.icon }]}>{item.account ?? item.accountId}</ThemedText>
                  {(() => {
                    const noteText = item.note;
                    const payeeText = item.payee;
                    const labelText = (item.labels && item.labels.length > 0) ? item.labels[0] : null;
                   
                    let combinedText = '';
                    if (noteText && payeeText) {
                      combinedText = `${noteText} - ${payeeText}`;
                    } else if (noteText) {
                      combinedText = noteText;
                    } else if (payeeText) {
                      combinedText = payeeText;
                    } else if (labelText) {
                      combinedText = labelText;
                    }
                   
                    return combinedText ? (
                      <ThemedText style={[recordsStyles.itemNote, { color: palette.icon, fontStyle: 'italic' }]}>
                        "{combinedText}"
                      </ThemedText>
                    ) : null;
                  })()}
                </View>
                <View style={recordsStyles.itemMeta}>
                  <ThemedText style={[recordsStyles.itemAmount, { color: amountColor }]}>{formatCurrency ? formatCurrency(item.amount, item.type) : (item.type === 'income' ? '+' : '-') + `$${Math.abs(item.amount).toFixed(2)}`}</ThemedText>
                  <ThemedText style={[recordsStyles.itemDate, { color: palette.icon }]}>{formatFriendlyDate(itemDate)}</ThemedText>
                </View>
              </View>
              {!isLast && <View style={[recordsStyles.listSeparator, { backgroundColor: palette.border }]} />}
            </TouchableOpacity>
          );
        }


        // default to home style
        return (
          <TouchableOpacity onPress={() => onPressItem?.(item)} style={{ paddingVertical: Spacing.sm }}>
            <View style={[homeStyles.recordRow]}>
              <View style={[homeStyles.recordIcon, { backgroundColor: `${categoryColor}15` }]}>
                <MaterialCommunityIcons name={iconName as any} size={20} color={categoryColor} />
              </View>
              <View style={homeStyles.recordContent}>
                <ThemedText style={homeStyles.recordTitle}>{getNodeDisplayName(item.subcategoryId) ?? getNodeDisplayName(item.categoryId) ?? item.title}</ThemedText>
                <ThemedText style={[homeStyles.recordSubtitle, { color: palette.icon }]}>{item.account ?? item.accountId}</ThemedText>
                {(() => {
                  const noteText = item.note;
                  const payeeText = item.payee;
                  const labelText = (item.labels && item.labels.length > 0) ? item.labels[0] : null;
                 
                  let combinedText = '';
                  if (noteText && payeeText) {
                    combinedText = `${noteText} - ${payeeText}`;
                  } else if (noteText) {
                    combinedText = noteText;
                  } else if (payeeText) {
                    combinedText = payeeText;
                  } else if (labelText) {
                    combinedText = labelText;
                  }
                 
                  return combinedText ? (
                    <ThemedText style={[homeStyles.recordSubtitle, { color: palette.icon, fontStyle: 'italic' }]}>
                      "{combinedText}"
                    </ThemedText>
                  ) : null;
                })()}
              </View>
              <View style={homeStyles.recordMeta}>
                <ThemedText style={[homeStyles.recordAmount, { color: amountColor }]}>{formatCurrency ? formatCurrency(item.amount, item.type) : (item.type === 'income' ? '+' : '-') + `$${Math.abs(item.amount).toFixed(2)}`}</ThemedText>
                <ThemedText style={{ color: palette.icon }}>{formatFriendlyDate(itemDate)}</ThemedText>
              </View>
            </View>
            {!isLast && <View style={[homeStyles.recordDivider, { backgroundColor: palette.border }]} />}
          </TouchableOpacity>
        );
      }}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      scrollEnabled={variant === 'records'}
      contentContainerStyle={{ paddingBottom: Spacing.lg + bottomInset }}
    />
  );
}
