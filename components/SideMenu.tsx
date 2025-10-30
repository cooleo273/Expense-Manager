import { Colors } from '@/constants/theme';
import { useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type SideMenuProps = {
  visible: boolean;
  onClose: () => void;
};

const MENU_WIDTH = 320;

export const SideMenu: React.FC<SideMenuProps> = ({ visible, onClose }) => {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const { filters, setSelectedAccount, setSearchTerm, setDateRange } = useFilterContext();
  const [isMounted, setIsMounted] = useState(visible);
  const animation = useRef(new Animated.Value(0)).current;

  const [calendarOption, setCalendarOption] = useState<'all' | 'week' | 'month' | 'custom'>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const handleCalendarChange = (option: 'all' | 'week' | 'month' | 'custom') => {
    setCalendarOption(option);
    if (option === 'all') {
      setDateRange(null);
    } else if (option === 'week') {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay()); // Monday
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Sunday
      setDateRange({ start, end });
    } else if (option === 'month') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateRange({ start, end });
    } else if (option === 'custom') {
      // Will set when dates are entered
    }
  };

  const handleCustomDateSet = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      if (start <= end) {
        setDateRange({ start, end });
      } else {
        Alert.alert('Invalid Dates', 'Start date must be before end date.');
      }
    }
  };

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (isMounted) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setIsMounted(false);
        }
      });
    }
  }, [animation, isMounted, visible]);

  if (!isMounted) {
    return null;
  }

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-MENU_WIDTH, 0],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>
        <Animated.View
          style={[
            styles.menu,
            {
              backgroundColor: palette.card,
              transform: [{ translateX }],
              shadowColor: colorScheme === 'dark' ? '#000000' : 'rgba(15,23,42,0.25)',
            },
          ]}
        >
          <Text style={[styles.title, { color: palette.text }]}>Filters</Text>

          {/* Account Dropdown */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: palette.text }]}>Account</Text>
            <TouchableOpacity
              style={[styles.dropdown, { borderColor: palette.border }]}
              onPress={() => {
                setSelectedAccount(filters.selectedAccount === 'all' ? 'account1' : 'all');
              }}
            >
              <Text style={{ color: palette.text }}>
                {filters.selectedAccount === 'all' ? 'All Accounts' : 'Account 1'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: palette.text }]}>Search</Text>
            <TextInput
              style={[styles.input, { borderColor: palette.border, color: palette.text }]}
              placeholder="Search..."
              placeholderTextColor={palette.icon}
              value={filters.searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {/* Calendar */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: palette.text }]}>Calendar</Text>
            <TouchableOpacity
              style={[styles.option, calendarOption === 'all' && { backgroundColor: palette.tint }]}
              onPress={() => handleCalendarChange('all')}
            >
              <Text style={{ color: calendarOption === 'all' ? palette.background : palette.text }}>All Time</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, calendarOption === 'week' && { backgroundColor: palette.tint }]}
              onPress={() => handleCalendarChange('week')}
            >
              <Text style={{ color: calendarOption === 'week' ? palette.background : palette.text }}>This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, calendarOption === 'month' && { backgroundColor: palette.tint }]}
              onPress={() => handleCalendarChange('month')}
            >
              <Text style={{ color: calendarOption === 'month' ? palette.background : palette.text }}>This Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, calendarOption === 'custom' && { backgroundColor: palette.tint }]}
              onPress={() => handleCalendarChange('custom')}
            >
              <Text style={{ color: calendarOption === 'custom' ? palette.background : palette.text }}>Custom</Text>
            </TouchableOpacity>
            {calendarOption === 'custom' && (
              <View style={styles.customDates}>
                <TextInput
                  style={[styles.input, { borderColor: palette.border, color: palette.text }]}
                  placeholder="Start Date (YYYY-MM-DD)"
                  placeholderTextColor={palette.icon}
                  value={customStart}
                  onChangeText={setCustomStart}
                />
                <TextInput
                  style={[styles.input, { borderColor: palette.border, color: palette.text }]}
                  placeholder="End Date (YYYY-MM-DD)"
                  placeholderTextColor={palette.icon}
                  value={customEnd}
                  onChangeText={setCustomEnd}
                />
                <TouchableOpacity style={[styles.button, { backgroundColor: palette.tint }]} onPress={handleCustomDateSet}>
                  <Text style={{ color: palette.background }}>Set Dates</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.closeButton, { backgroundColor: palette.tint }]} onPress={onClose}>
            <Text style={{ color: palette.background }}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  menu: {
    width: MENU_WIDTH,
    padding: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 12,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  option: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  customDates: {
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
});