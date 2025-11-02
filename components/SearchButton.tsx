import { Colors } from '@/constants/theme';
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
        style={{ marginHorizontal: 5 }}
      >
        <MaterialCommunityIcons name="magnify" size={24} color={palette.text} accessibilityHint={undefined} />
      </Pressable>
      <SearchOverlay visible={searchVisible} onClose={() => setSearchVisible(false)} />
    </>
  );
};