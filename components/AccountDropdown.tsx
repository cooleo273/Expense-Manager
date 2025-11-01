import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const accounts = [
  { id: 'all', name: 'All Accounts' },
  { id: 'icici-bank', name: 'ICICI Bank' },
  { id: 'sbi-bank', name: 'SBI Bank' },
  { id: 'axis-card', name: 'Axis Card' },
  { id: 'icici-card', name: 'ICICI Card' },
  { id: 'paytm', name: 'Paytm' },
  { id: 'cash', name: 'Cash' },
];

const DROPDOWN_MAX_HEIGHT = 240;

export const AccountDropdown: React.FC = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [anchorLayout, setAnchorLayout] = useState<{ top: number; left: number; width: number } | null>(null);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const { filters, setSelectedAccount } = useFilterContext();
  const anchorRef = useRef<View | null>(null);

  const selectedAccount = accounts.find(acc => acc.id === filters.selectedAccount) || accounts[0];

  const handleSelect = (accountId: string) => {
    setSelectedAccount(accountId);
    setDropdownVisible(false);
  };

  const openDropdown = () => {
    anchorRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      const screen = Dimensions.get('window');
      const dropdownWidth = Math.max(width, 180);
      const horizontalPadding = 16;
      const clampedLeft = Math.min(x, screen.width - dropdownWidth - horizontalPadding);
      const left = Math.max(horizontalPadding, clampedLeft);
      const spaceBelow = screen.height - (y + height);
      const belowTop = y + height + 6;
      const aboveTop = Math.max(horizontalPadding, y - DROPDOWN_MAX_HEIGHT - 6);
      const top = spaceBelow < DROPDOWN_MAX_HEIGHT + 12 ? aboveTop : belowTop;
      setAnchorLayout({ top, left, width: dropdownWidth });
      setDropdownVisible(true);
    });
  };

  const closeDropdown = () => {
    setDropdownVisible(false);
  };

  return (
    <View ref={anchorRef} collapsable={false}>
      <TouchableOpacity
        style={[styles.dropdown, { borderColor: palette.border }]}
        onPress={openDropdown}
      >
        <Text style={{ color: palette.text }}>{selectedAccount.name}</Text>
        <MaterialCommunityIcons name="chevron-down" size={16} color={palette.icon} />
      </TouchableOpacity>
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'box-none' }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDropdown}>
            <View style={styles.overlay} />
          </Pressable>
          {anchorLayout && (
            <View style={[StyleSheet.absoluteFill, { pointerEvents: 'box-none' }]}>
              <View
                style={[
                  styles.dropdownMenu,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                    top: anchorLayout.top,
                    left: anchorLayout.left,
                    width: anchorLayout.width,
                  },
                ]}
              >
                <FlatList
                  data={accounts}
                  keyExtractor={(item) => item.id}
                  style={{ maxHeight: DROPDOWN_MAX_HEIGHT }}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleSelect(item.id)}
                    >
                      <Text style={{ color: palette.text }}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  dropdownMenu: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    maxHeight: DROPDOWN_MAX_HEIGHT,
    overflow: 'hidden',
    ...Shadows.medium,
    zIndex: 10,
  },
  dropdownItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
});