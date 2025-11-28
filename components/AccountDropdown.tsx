import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mockAccounts, type MockAccount } from '../constants/mock-data';

const DROPDOWN_MAX_HEIGHT = 240;

 type AccountDropdownProps = {
  allowAll?: boolean;
  useGlobalState?: boolean;
  onSelect?: (accountId: string) => void;
  selectedId?: string;
 };

export const AccountDropdown: React.FC<AccountDropdownProps> = ({
  allowAll = true,
  useGlobalState = true,
  onSelect,
  selectedId,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [anchorLayout, setAnchorLayout] = useState<{ top: number; left: number; width: number } | null>(null);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { filters, setSelectedAccount } = useFilterContext();
  const anchorRef = useRef<View | null>(null);

  const accountOptions = useMemo(
    () => (allowAll ? mockAccounts : mockAccounts.filter(acc => acc.id !== 'all')),
    [allowAll]
  );

  const fallbackAccount = accountOptions[0] as MockAccount | undefined;
  const globalSelection = accountOptions.find(acc => acc.id === filters.selectedAccount) || fallbackAccount!;

  useEffect(() => {
    if (useGlobalState && !globalSelection && accountOptions.length > 0) {
      setSelectedAccount(accountOptions[0].id);
    }
  }, [globalSelection, accountOptions, setSelectedAccount, useGlobalState]);

  if (!accountOptions.length) {
    return null;
  }

  const [localSelection, setLocalSelection] = useState<string | undefined>(
    () => selectedId ?? fallbackAccount?.id
  );

  useEffect(() => {
    if (!useGlobalState && selectedId && selectedId !== localSelection) {
      setLocalSelection(selectedId);
    }
  }, [localSelection, selectedId, useGlobalState]);

  const handleSelect = (accountId: string) => {
    if (useGlobalState) {
      setSelectedAccount(accountId);
    } else {
      setLocalSelection(accountId);
      onSelect?.(accountId);
    }
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
        style={[styles.anchorButton, { backgroundColor: palette.card }]}
        onPress={openDropdown}
        activeOpacity={0.8}
      >
        <View style={styles.anchorTextWrapper}>
          <Text
            style={[styles.anchorTitle, { color: palette.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {(useGlobalState
              ? globalSelection?.name
              : accountOptions.find(a => a.id === localSelection)?.name) ?? globalSelection?.name}
          </Text>
          {((useGlobalState ? globalSelection : accountOptions.find(a => a.id === localSelection))?.subtitle) ? (
            <Text style={[styles.anchorSubtitle, { color: palette.icon }]} numberOfLines={1}>
              {(useGlobalState ? globalSelection : accountOptions.find(a => a.id === localSelection))?.subtitle}
            </Text>
          ) : null}
        </View>
        <MaterialCommunityIcons name="chevron-down" size={18} color={palette.icon} />
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
                  data={accountOptions}
                  keyExtractor={(item) => item.id}
                  style={{ maxHeight: DROPDOWN_MAX_HEIGHT }}
                  ItemSeparatorComponent={() => (
                    <View style={[styles.dropdownDivider, { backgroundColor: palette.border }]} />
                  )}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const isSelected = item.id === (useGlobalState ? globalSelection.id : localSelection);
                    return (
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          { backgroundColor: isSelected ? `${palette.tint}10` : 'transparent' },
                        ]}
                        activeOpacity={0.85}
                        onPress={() => handleSelect(item.id)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.dropdownTitle, { color: palette.text }]}>{item.name}</Text>
                          {item.subtitle ? (
                            <Text style={[styles.dropdownSubtitle, { color: palette.icon }]} numberOfLines={1}>
                              {item.subtitle}
                            </Text>
                          ) : null}
                        </View>
                          {isSelected && (
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={18}
                            color={palette.tint}
                            style={{ marginLeft: Spacing.sm }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
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
  anchorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.sm,
    minWidth: 180,
  },
  anchorTextWrapper: {
    flexShrink: 1,
    marginRight: Spacing.sm,
  },
  anchorTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  anchorSubtitle: {
    fontSize: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  dropdownMenu: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    maxHeight: DROPDOWN_MAX_HEIGHT,
    overflow: 'hidden',
    ...Shadows.medium,
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dropdownTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownSubtitle: {
    fontSize: 12,
  },
  dropdownDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
  },
});