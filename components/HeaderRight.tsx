import React from 'react';
import { View } from 'react-native';
import { AccountDropdown } from './AccountDropdown';
import { CalendarButton } from './CalendarButton';
import { SearchButton } from './SearchButton';

export const HeaderRight: React.FC = () => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <AccountDropdown />
      <SearchButton />
      <CalendarButton />
    </View>
  );
};