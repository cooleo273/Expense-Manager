import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Menu } from 'react-native-paper';

import { mockAccounts, type MockAccount } from '@/constants/mock-data';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AccountDropdownProps = {
  allowAll?: boolean;
  useGlobalState?: boolean;
  onSelect?: (accountId: string) => void;
  selectedId?: string;
  hideLabelWhenAll?: boolean;
  allLabelOverride?: string;
  showSelectedLabel?: boolean;
};

const MENU_MIN_WIDTH = 200;

export const AccountDropdown: React.FC<AccountDropdownProps> = ({
  allowAll = true,
  useGlobalState = true,
  onSelect,
  selectedId,
  hideLabelWhenAll = false,
  allLabelOverride,
  showSelectedLabel = true,
}) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { filters, setSelectedAccount } = useFilterContext();

  const accountOptions = useMemo(() => {
    if (allowAll) {
      return mockAccounts;
    }
    return mockAccounts.filter((account) => account.id !== 'all');
  }, [allowAll]);

  const firstAvailableId = accountOptions[0]?.id ?? 'all';

  const [localSelection, setLocalSelection] = useState<string>(() => {
    if (useGlobalState) {
      return filters.selectedAccount ?? firstAvailableId;
    }
    if (selectedId && accountOptions.some((account) => account.id === selectedId)) {
      return selectedId;
    }
    return firstAvailableId;
  });

  useEffect(() => {
    if (useGlobalState) {
      return;
    }
    if (selectedId && accountOptions.some((account) => account.id === selectedId)) {
      setLocalSelection(selectedId);
    }
  }, [selectedId, accountOptions, useGlobalState]);

  useEffect(() => {
    if (!useGlobalState) {
      return;
    }
    if (filters.selectedAccount && filters.selectedAccount !== localSelection) {
      setLocalSelection(filters.selectedAccount);
    }
  }, [filters.selectedAccount, localSelection, useGlobalState]);

  const resolvedSelection: MockAccount | undefined = useMemo(() => {
    const activeId = useGlobalState ? filters.selectedAccount : localSelection;
    const match = accountOptions.find((account) => account.id === activeId);
    return match ?? accountOptions[0];
  }, [accountOptions, filters.selectedAccount, localSelection, useGlobalState]);

  const anchorLabel = useMemo(() => {
    if (!showSelectedLabel || !resolvedSelection) {
      return '';
    }
    if (resolvedSelection.id === 'all') {
      if (hideLabelWhenAll) {
        return '';
      }
      return allLabelOverride ?? 'All Accounts';
    }
    return resolvedSelection.name;
  }, [resolvedSelection, hideLabelWhenAll, allLabelOverride, showSelectedLabel]);

  const [menuVisible, setMenuVisible] = useState(false);
  const openMenu = useCallback(() => setMenuVisible(true), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

  const handleSelect = useCallback(
    (accountId: string) => {
      if (useGlobalState) {
        setSelectedAccount(accountId);
      } else {
        setLocalSelection(accountId);
      }
      onSelect?.(accountId);
      closeMenu();
    },
    [closeMenu, onSelect, setSelectedAccount, useGlobalState],
  );

  return (
    <Menu
      visible={menuVisible}
      onDismiss={closeMenu}
      anchor={
        <TouchableOpacity
          style={[
            styles.anchorButton,
            { backgroundColor: palette.card },
            !anchorLabel && styles.anchorButtonCompact,
          ]}
          onPress={openMenu}
          activeOpacity={0.85}
        >
          {anchorLabel ? (
            <View style={styles.anchorTextWrapper}>
              <Text style={[styles.anchorTitle, { color: palette.text }]} numberOfLines={1}>
                {anchorLabel}
              </Text>
              {resolvedSelection?.subtitle ? (
                <Text style={[styles.anchorSubtitle, { color: palette.icon }]} numberOfLines={1}>
                  {resolvedSelection.subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}
          <MaterialCommunityIcons
            name={menuVisible ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={palette.icon}
          />
        </TouchableOpacity>
      }
      anchorPosition="bottom"
      contentStyle={[
        styles.menuContent,
        {
          backgroundColor: palette.card,
          borderColor: palette.border,
        },
      ]}
    >
      {accountOptions.map((option) => {
        const isSelected = option.id === resolvedSelection?.id;
        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => handleSelect(option.id)}
            style={[
              styles.menuItem,
              isSelected && { backgroundColor: `${palette.tint}12` },
            ]}
            activeOpacity={0.85}
          >
            <View style={styles.menuItemText}>
              <Text style={[styles.menuTitle, { color: palette.text }]} numberOfLines={1}>
                {option.name}
              </Text>
              {option.subtitle ? (
                <Text style={[styles.menuDescription, { color: palette.icon }]} numberOfLines={1}>
                  {option.subtitle}
                </Text>
              ) : null}
            </View>
            {isSelected ? (
              <MaterialCommunityIcons name="check" size={18} color={palette.tint} />
            ) : null}
          </TouchableOpacity>
        );
      })}
    </Menu>
  );
};

const styles = StyleSheet.create({
  anchorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    marginLeft: Spacing.md,
    minHeight: 44,
    minWidth: 180,
    gap: Spacing.xs,
    alignSelf: 'stretch',
  },
  anchorButtonCompact: {
    minWidth: 44,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.xs,
    justifyContent: 'flex-start',
    alignSelf: 'center',
  },
  anchorTextWrapper: {
    flexShrink: 1,
  },
  anchorTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  anchorSubtitle: {
    fontSize: 12,
  },
  menuContent: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    minWidth: MENU_MIN_WIDTH,
    paddingVertical: 0,
    ...Shadows.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  menuItemText: {
    flexShrink: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuDescription: {
    fontSize: 12,
  },
});
