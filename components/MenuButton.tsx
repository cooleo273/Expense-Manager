            import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationDrawer } from './NavigationDrawer';

export const MenuButton: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  return (
    <>
      <TouchableOpacity
        onPress={() => setDrawerVisible(true)}
        style={{ marginLeft: 16 }}
      >
        <MaterialCommunityIcons name="menu" size={24} color={palette.text} />
      </TouchableOpacity>
      <NavigationDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </>
  );
};;