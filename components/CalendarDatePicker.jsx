import { useAppTheme } from '@/context/app-theme-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function formatDisplayDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function parseDisplayDate(value, fallback = new Date()) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}

/**
 * Google-style calendar date selector.
 * Opens a month grid (and uses the native picker on Android when available).
 */
export default function CalendarDatePicker({
  label = 'Date',
  value,
  onChange,
  minimumDate,
}) {
  const { palette } = useAppTheme();
  const selected = useMemo(() => parseDisplayDate(value), [value]);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(selected.getFullYear(), selected.getMonth(), 1),
  );
  const [androidNative, setAndroidNative] = useState(false);

  const minDate = minimumDate || new Date();

  const days = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  const selectDay = (day) => {
    const next = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day,
    );
    next.setHours(12, 0, 0, 0);
    onChange?.(next, formatDisplayDate(next));
    setOpen(false);
    setAndroidNative(false);
  };

  const shiftMonth = (delta) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + delta, 1),
    );
  };

  const openPicker = () => {
    setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    if (Platform.OS === 'android') {
      setAndroidNative(true);
    } else {
      setOpen(true);
    }
  };

  const onNativeChange = (event, date) => {
    if (Platform.OS === 'android') {
      setAndroidNative(false);
      if (event.type === 'dismissed') return;
    }
    if (date) {
      const next = new Date(date);
      next.setHours(12, 0, 0, 0);
      onChange?.(next, formatDisplayDate(next));
      setVisibleMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[styles.label, { color: palette.textSecondary }]}>
          {label}
        </Text>
      ) : null}

      <Pressable
        onPress={openPicker}
        style={[
          styles.field,
          {
            backgroundColor: palette.softCard,
            borderColor: '#95BEF0',
          },
        ]}
      >
        <Ionicons name="calendar-outline" size={18} color={palette.accent} />
        <Text style={[styles.fieldText, { color: palette.textPrimary }]}>
          {formatDisplayDate(selected)}
        </Text>
        <Ionicons name="chevron-down" size={16} color={palette.textSecondary} />
      </Pressable>

      {androidNative ? (
        <DateTimePicker
          value={selected}
          mode="date"
          display="calendar"
          minimumDate={minDate}
          onChange={onNativeChange}
        />
      ) : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: palette.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>
                Select date
              </Text>
              <Pressable onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={palette.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.monthRow}>
              <Pressable
                onPress={() => shiftMonth(-1)}
                style={[styles.navBtn, { backgroundColor: palette.softCard }]}
              >
                <Ionicons name="chevron-back" size={18} color={palette.textPrimary} />
              </Pressable>
              <Text style={[styles.monthLabel, { color: palette.textPrimary }]}>
                {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
              </Text>
              <Pressable
                onPress={() => shiftMonth(1)}
                style={[styles.navBtn, { backgroundColor: palette.softCard }]}
              >
                <Ionicons name="chevron-forward" size={18} color={palette.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((day, index) => (
                <Text
                  key={`${day}-${index}`}
                  style={[styles.weekDay, { color: palette.textSecondary }]}
                >
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {days.map((cell, index) => {
                if (!cell) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const cellDate = new Date(
                  visibleMonth.getFullYear(),
                  visibleMonth.getMonth(),
                  cell,
                );
                cellDate.setHours(12, 0, 0, 0);
                const disabled = cellDate < startOfDay(minDate);
                const isSelected = sameDay(cellDate, selected);
                const isToday = sameDay(cellDate, new Date());

                return (
                  <Pressable
                    key={`day-${cell}`}
                    disabled={disabled}
                    onPress={() => selectDay(cell)}
                    style={[
                      styles.dayCell,
                      isSelected && {
                        backgroundColor: palette.accent,
                        borderRadius: 20,
                      },
                      !isSelected &&
                        isToday && {
                          borderWidth: 1,
                          borderColor: palette.accent,
                          borderRadius: 20,
                        },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isSelected || isToday ? '700' : '500',
                        color: disabled
                          ? palette.textSecondary + '55'
                          : isSelected
                            ? '#FFFFFF'
                            : palette.textPrimary,
                      }}
                    >
                      {cell}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[styles.doneBtn, { backgroundColor: palette.accent }]}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function buildMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500' },
  field: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 21, 35, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  sheet: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: { fontSize: 18, fontWeight: '700' },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { fontSize: 16, fontWeight: '700' },
  weekRow: { flexDirection: 'row' },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iosNativeWrap: { gap: 8 },
  doneBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
