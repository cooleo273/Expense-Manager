import { Colors, IconSizes, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { SearchOverlay } from './SearchOverlay';

export const SearchButton: React.FC = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  return (
    <>
      <Pressable
        onPress={() => setSearchVisible(true)}
        style={{ marginHorizontal: Spacing.xsm }}
      >
        <MaterialCommunityIcons name="magnify" size={IconSizes.xl} color={palette.text} />
      </TouchableOpacity>
      <SearchOverlay visible={searchVisible} onClose={() => setSearchVisible(false)} />
    </>
  );
};