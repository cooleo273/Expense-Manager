import { Colors, IconSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { AccountDropdown } from './AccountDropdown';
import { NavigationDrawer } from './NavigationDrawer';

export const MenuButton: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  return (
    <>
      <Pressable
        onPress={() => setDrawerVisible(true)}
        style={{ marginLeft: Spacing.lg }}
      >
        <MaterialCommunityIcons name="menu" size={IconSizes.xl} color={palette.text} />
      </Pressable>
      <NavigationDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      <AccountDropdown />
    </>
  );
};;