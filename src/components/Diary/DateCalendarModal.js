import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, X, CalendarDays } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_SIZE = 40;

function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayKey() {
  return toKey(new Date());
}

function buildMonthWeeks(year, month) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const flat = [];
  for (let i = 0; i < startPad; i += 1) flat.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) flat.push(day);
  while (flat.length % 7 !== 0) flat.push(null);

  const weeks = [];
  for (let i = 0; i < flat.length; i += 7) {
    weeks.push(flat.slice(i, i + 7));
  }
  return weeks;
}

function DayCell({ day, viewYear, viewMonth, selectedKey, today, isDark, c, onPick }) {
  if (!day) {
    return <View style={styles.daySlot} />;
  }

  const key = toKey(new Date(viewYear, viewMonth, day, 12, 0, 0));
  const isSelected = key === selectedKey;
  const isToday = key === today;

  return (
    <View style={styles.daySlot}>
      <Pressable
        onPress={() => onPick(day)}
        style={({ pressed }) => [
          styles.dayInner,
          isSelected && styles.daySelected,
          !isSelected && isToday && styles.dayToday,
          !isSelected && isToday && { backgroundColor: isDark ? '#1A2744' : colors.primarySoft },
          isSelected && { backgroundColor: colors.primary },
          pressed && !isSelected && { opacity: 0.72 },
        ]}
      >
        <Text
          style={[
            styles.dayText,
            { color: c.text, fontFamily: snPro('600') },
            isSelected && styles.dayTextSelected,
            !isSelected && isToday && { color: colors.primary },
          ]}
        >
          {day}
        </Text>
      </Pressable>
    </View>
  );
}

export default function DateCalendarModal({ visible, onClose, selectedKey, onSelectDate }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const selected = parseKey(selectedKey);
  const [pendingKey, setPendingKey] = useState(selectedKey);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  useEffect(() => {
    if (visible) {
      const d = parseKey(selectedKey);
      setPendingKey(selectedKey);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [visible, selectedKey]);

  const weeks = useMemo(() => buildMonthWeeks(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  const today = todayKey();
  const sheetWidth = Math.min(width, 480);

  const shiftMonth = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const pickDay = (day) => {
    const key = toKey(new Date(viewYear, viewMonth, day, 12, 0, 0));
    setPendingKey(key);
  };

  const jumpToToday = () => {
    const key = todayKey();
    setPendingKey(key);
    const d = parseKey(key);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleContinue = () => {
    onSelectDate(pendingKey);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: c.cardBg,
              paddingBottom: Math.max(insets.bottom, 20),
              width: sheetWidth,
              alignSelf: 'center',
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.head}>
            <View style={styles.headLeft}>
              <View style={[styles.headIcon, { backgroundColor: isDark ? '#1A2744' : colors.primarySoft }]}>
                <CalendarDays size={16} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: c.text, fontFamily: FONT.nova }]}>Pick a date</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={[styles.close, { backgroundColor: c.chip }]}
            >
              <X size={18} color={c.text} />
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          <View style={styles.monthRow}>
            <Pressable
              onPress={() => shiftMonth(-1)}
              hitSlop={6}
              style={[styles.nav, { backgroundColor: c.chip, borderColor: c.border }]}
            >
              <ChevronLeft size={18} color={c.text} />
            </Pressable>
            <Text style={[styles.monthLabel, { color: c.text, fontFamily: snPro('700') }]}>{monthLabel}</Text>
            <Pressable
              onPress={() => shiftMonth(1)}
              hitSlop={6}
              style={[styles.nav, { backgroundColor: c.chip, borderColor: c.border }]}
            >
              <ChevronRight size={18} color={c.text} />
            </Pressable>
          </View>

          <View style={styles.weekHeader}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={[styles.weekday, { color: c.muted, fontFamily: snPro('700') }]}>
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.calendarBody}>
            {weeks.map((week, wi) => (
              <View key={`week-${wi}`} style={styles.weekRow}>
                {week.map((day, di) => (
                  <DayCell
                    key={`${wi}-${di}-${day ?? 'x'}`}
                    day={day}
                    viewYear={viewYear}
                    viewMonth={viewMonth}
                    selectedKey={pendingKey}
                    today={today}
                    isDark={isDark}
                    c={c}
                    onPick={pickDay}
                  />
                ))}
              </View>
            ))}
          </View>

          <View style={styles.footerRow}>
            <Pressable
              onPress={jumpToToday}
              style={({ pressed }) => [
                styles.footerBtn,
                styles.secondaryBtn,
                {
                  borderColor: c.border,
                  backgroundColor: isDark ? '#1C1C1E' : '#F8FAFC',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.primary, fontFamily: snPro('700') }]}>
                Jump to today
              </Text>
            </Pressable>
            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.footerBtn,
                styles.primaryBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <Text style={[styles.primaryBtnText, { fontFamily: snPro('700') }]}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxWidth: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -6 },
      },
      android: { elevation: 16 },
    }),
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 99,
    backgroundColor: '#C5CCD6',
    alignSelf: 'center',
    marginBottom: 16,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 20,
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  nav: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  calendarBody: {
    marginBottom: 4,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  daySlot: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInner: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    borderRadius: DAY_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    borderRadius: DAY_SIZE / 2,
  },
  dayToday: {
    borderRadius: 12,
  },
  dayText: {
    fontSize: 15,
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    borderWidth: 1,
    marginRight: 10,
  },
  secondaryBtnText: {
    fontSize: 14,
  },
  primaryBtn: {},
  primaryBtnText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
});
