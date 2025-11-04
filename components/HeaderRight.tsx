import React from 'react';
import { View } from 'react-native';
import { CalendarButton } from './CalendarButton';
import { SearchButton } from './SearchButton';
import { Spacing } from '@/constants/theme';

export const HeaderRight: React.FC = () => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
      <SearchButton />
      <CalendarButton />
    </View>
  );
};