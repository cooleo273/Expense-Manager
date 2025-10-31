import { BorderRadius, Colors, FontSizes, FontWeights, Shadows, Spacing } from '@/constants/theme';
import { DateRange, useFilterContext } from '@/contexts/FilterContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DraftRange = {
  start: Date;
  end?: Date;
};

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const getMonthMatrix = (cursor: Date) => {
  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const firstDayOfWeek = (firstOfMonth.getDay() + 6) % 7; // start week on Monday
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstDayOfWeek);

  const weeks: Date[][] = [];
  for (let week = 0; week < 6; week++) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + week * 7 + day);
      days.push(date);
    }
    weeks.push(days);
  }
  return weeks;
};

const formatMonthTitle = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarButton: React.FC = () => {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [monthCursor, setMonthCursor] = useState(startOfDay(new Date()));
  const [draftRange, setDraftRange] = useState<DraftRange | null>(null);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const { setDateRange, filters } = useFilterContext();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (calendarVisible) {
      if (filters.dateRange) {
        setDraftRange({ start: startOfDay(filters.dateRange.start), end: startOfDay(filters.dateRange.end) });
        setMonthCursor(startOfDay(filters.dateRange.start));
      } else {
        setDraftRange(null);
        setMonthCursor(startOfDay(new Date()));
      }
    }
  }, [calendarVisible, filters.dateRange]);

  const monthMatrix = useMemo(() => getMonthMatrix(monthCursor), [monthCursor]);

  const isWithinDraftRange = (date: Date) => {
    if (!draftRange) {
      return false;
    }

    if (draftRange.start && draftRange.end) {
      const start = draftRange.start < draftRange.end ? draftRange.start : draftRange.end;
      const end = draftRange.start < draftRange.end ? draftRange.end : draftRange.start;
      return date >= start && date <= end;
    }

    return draftRange.start && isSameDay(draftRange.start, date);
  };

  const handleDayPress = (date: Date) => {
    const normalized = startOfDay(date);
    setDraftRange(prev => {
      if (!prev || (prev.start && prev.end)) {
        return { start: normalized };
      }

      if (prev.start && !prev.end) {
        return { start: prev.start, end: normalized };
      }

      return { start: normalized };
    });
  };

  const applyRange = (range: DateRange | null) => {
    setDateRange(range);
    setCalendarVisible(false);
  };

  const handleConfirm = () => {
    if (!draftRange) {
      applyRange(null);
      return;
    }

    const { start, end } = draftRange;
    if (start && end) {
      const orderedStart = start < end ? start : end;
      const orderedEnd = start < end ? end : start;
      applyRange({ start: orderedStart, end: orderedEnd });
    } else if (start) {
      applyRange({ start, end: start });
    }
  };

  const quickSelect = (option: 'all' | 'week' | 'month') => {
    const now = new Date();
    if (option === 'all') {
      applyRange(null);
      return;
    }

    if (option === 'week') {
      const start = startOfDay(now);
      const weekday = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - weekday);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      applyRange({ start, end });
      return;
    }

    if (option === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      applyRange({ start: startOfDay(start), end: startOfDay(end) });
    }
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setCalendarVisible(true)}
        style={{ marginHorizontal: Spacing.xs, marginRight: Spacing.lg }}
      >
        <MaterialCommunityIcons name="calendar" size={24} color={palette.text} />
      </TouchableOpacity>
      <Modal
        visible={calendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCalendarVisible(false)}>
            <View style={styles.backdrop} />
          </Pressable>
          <View
            style={[
              styles.calendarSheet,
              {
                backgroundColor: palette.card,
                marginTop: insets.top + Spacing.lg,
                marginRight: Spacing.lg,
                shadowColor: 'rgba(15,23,42,0.25)',
              },
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: palette.text }]}>Select Period</Text>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color={palette.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.quickRow}>
              <TouchableOpacity
                style={[styles.quickChip, { borderColor: palette.border }]}
                onPress={() => quickSelect('week')}
              >
                <Text style={{ color: palette.text }}>This Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickChip, { borderColor: palette.border }]}
                onPress={() => quickSelect('month')}
              >
                <Text style={{ color: palette.text }}>This Month</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickChip, { borderColor: palette.border }]}
                onPress={() => quickSelect('all')}
              >
                <Text style={{ color: palette.text }}>All Time</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.monthHeader}>
              <TouchableOpacity onPress={() => setMonthCursor(prev => addMonths(prev, -1))} style={styles.navButton}>
                <MaterialCommunityIcons name="chevron-left" size={22} color={palette.icon} />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: palette.text }]}>{formatMonthTitle(monthCursor)}</Text>
              <TouchableOpacity onPress={() => setMonthCursor(prev => addMonths(prev, 1))} style={styles.navButton}>
                <MaterialCommunityIcons name="chevron-right" size={22} color={palette.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekHeaderRow}>
              {weekDayLabels.map(label => (
                <Text key={label} style={[styles.weekHeaderCell, { color: palette.icon }]}>{label}</Text>
              ))}
            </View>

            {monthMatrix.map((week, idx) => (
              <View key={idx} style={styles.weekRow}>
                {week.map(day => {
                  const inMonth = day.getMonth() === monthCursor.getMonth();
                  const isStart = draftRange?.start && isSameDay(draftRange.start, day);
                  const isEnd = draftRange?.end && isSameDay(draftRange.end, day);
                  const isActive = isWithinDraftRange(day);
                  return (
                    <TouchableOpacity
                      key={day.toISOString()}
                      onPress={() => handleDayPress(day)}
                      style={[
                        styles.dayCell,
                        isActive && { backgroundColor: palette.highlight },
                        (isStart || isEnd) && { backgroundColor: palette.tint },
                        !inMonth && { opacity: 0.35 },
                      ]}
                    >
                      <Text style={{ color: (isStart || isEnd) ? palette.background : palette.text }}>{day.getDate()}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: palette.tint }]}
              onPress={handleConfirm}
            >
              <Text style={{ color: palette.background, fontWeight: FontWeights.semibold as any }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  calendarSheet: {
    alignSelf: 'flex-end',
    width: 320,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.modal,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    flex: 1,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.heavy as any,
  },
  quickRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  quickChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.lg,
  },
  monthTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold as any,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  weekHeaderCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold as any,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayCell: {
    flex: 1,
    height: 40,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
});