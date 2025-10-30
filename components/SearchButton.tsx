import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { SearchOverlay } from './SearchOverlay';

export const SearchButton: React.FC = () => {
  const [searchVisible, setSearchVisible] = useState(false);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

  return (
    <>
      <TouchableOpacity
        onPress={() => setSearchVisible(true)}
        style={{ marginHorizontal: 5 }}
      >
        <MaterialCommunityIcons name="magnify" size={24} color={palette.text} />
      </TouchableOpacity>
      <SearchOverlay visible={searchVisible} onClose={() => setSearchVisible(false)} />
    </>
  );
};