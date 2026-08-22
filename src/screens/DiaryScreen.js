import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Coffee,
  Utensils,
  Moon,
  Cookie,
  CalendarDays,
} from 'lucide-react-native';
import ScreenShell from '../components/ScreenShell';
import MealSection from '../components/MealSection';
import DateCalendarModal from '../components/DateCalendarModal';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { colors, themeColors } from '../config/colors';
import { FONT } from '../config/fonts';

const MEALS = [
  { key: 'breakfast', title: 'Breakfast', Icon: Coffee, accent: '#E68A00' },
  { key: 'lunch', title: 'Lunch', Icon: Utensils, accent: colors.primary },
  { key: 'dinner', title: 'Dinner', Icon: Moon, accent: '#6C5CE7' },
  { key: 'snacks', title: 'Snacks', Icon: Cookie, accent: colors.protein },
];

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 2 },
  default: {},
});

export default function DiaryScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { dateKey, setDateKey, meals, removeFood, remaining, totals, burned, exercise, profile } = useDiary();

  const shiftDay = (delta) => {
    const d = new Date(`${dateKey}T12:00:00`);
    d.setDate(d.getDate() + delta);
    setDateKey(d.toISOString().slice(0, 10));
  };

  const isToday = dateKey === localTodayKey();
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <ScreenShell>
      <DateCalendarModal
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        selectedKey={dateKey}
        onSelectDate={setDateKey}
      />
      <View style={styles.head}>
        <Pressable
          onPress={() => shiftDay(-1)}
          hitSlop={10}
          style={[styles.navBtn, { backgroundColor: c.chip, borderColor: c.border }]}
        >
          <ChevronLeft size={20} color={c.text} />
        </Pressable>
        <Pressable
          onPress={() => setCalendarOpen(true)}
          hitSlop={6}
          style={({ pressed }) => [styles.dateTap, pressed && styles.dateTapPressed]}
        >
          <Text style={[styles.title, { color: c.text }]}>Diary</Text>
          <View
            style={[
              styles.datePill,
              {
                backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft,
                borderColor: isToday ? colors.primary : c.border,
              },
            ]}
          >
            <CalendarDays size={14} color={isToday ? colors.primary : c.muted} />
            <Text style={[styles.date, { color: isToday ? colors.primary : c.text }]}>
              {isToday ? 'Today · ' : ''}{formatDate(dateKey)}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => shiftDay(1)}
          hitSlop={10}
          style={[styles.navBtn, { backgroundColor: c.chip, borderColor: c.border }]}
        >
          <ChevronRight size={20} color={c.text} />
        </Pressable>
      </View>

      <View style={[styles.summaryWrap, cardShadow, { borderColor: isDark ? c.border : 'rgba(0,112,224,0.12)' }]}>
        <LinearGradient
          colors={isDark ? ['#141414', '#121212'] : ['#FFFFFF', '#F3F8FF']}
          style={styles.summary}
        >
          <StatChip label="Goal" value={profile.calories} theme={c} isDark={isDark} />
          <StatChip label="Food" value={totals.calories} theme={c} isDark={isDark} accent={colors.primary} />
          <StatChip label="Exercise" value={burned} theme={c} isDark={isDark} accent={colors.exercise} />
          <StatChip label="Left" value={Math.max(0, remaining)} theme={c} isDark={isDark} accent={colors.primary} strong />
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.section, { color: c.muted }]}>MEALS</Text>

        {MEALS.map((m) => (
          <MealSection
            key={m.key}
            title={m.title}
            icon={m.Icon}
            accent={m.accent}
            items={meals[m.key]}
            theme={c}
            isDark={isDark}
            onAdd={() => navigation.navigate('AddFood', { meal: m.key })}
            onRemove={(logId) => removeFood(m.key, logId)}
          />
        ))}

        <Text style={[styles.section, { color: c.muted, marginTop: 4 }]}>ACTIVITY</Text>

        <View style={[styles.exCard, cardShadow, { borderColor: isDark ? c.border : 'rgba(52,199,89,0.18)' }]}>
          <LinearGradient
            colors={isDark ? ['#141414', '#121212'] : ['#FFFFFF', '#F0FFF5']}
            style={styles.exInner}
          >
            <View style={styles.exHead}>
              <View style={styles.exHeadLeft}>
                <View style={[styles.exIcon, { backgroundColor: isDark ? '#1C1C1E' : colors.accentSoft }]}>
                  <Flame size={16} color={colors.exercise} />
                </View>
                <View>
                  <Text style={[styles.exTitle, { color: c.text }]}>Exercise</Text>
                  <Text style={[styles.exSub, { color: c.muted }]}>{exercise.length} workout{exercise.length !== 1 ? 's' : ''}</Text>
                </View>
              </View>
              <View style={[styles.exCalBadge, { backgroundColor: isDark ? '#1C1C1E' : colors.accentSoft }]}>
                <Text style={[styles.exCalNum, { color: colors.exercise }]}>{burned}</Text>
                <Text style={[styles.exCalLbl, { color: c.muted }]}>kcal</Text>
              </View>
            </View>
            {exercise.map((item) => (
              <View key={item.logId} style={[styles.exRow, { borderTopColor: c.border }]}>
                <View style={[styles.exDot, { backgroundColor: colors.exercise }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exName, { color: c.text }]}>{item.name}</Text>
                  <Text style={[styles.exMeta, { color: c.muted }]}>{item.minutes} min · {item.calories} kcal burned</Text>
                </View>
              </View>
            ))}
          </LinearGradient>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

function StatChip({ label, value, theme, isDark, accent, strong }) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderColor: strong ? colors.primary : isDark ? theme.border : 'rgba(0,112,224,0.1)',
        },
      ]}
    >
      <Text style={[styles.chipVal, { color: accent || theme.text }]}>{value}</Text>
      <Text style={[styles.chipLbl, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

function localTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDate(key) {
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '400', fontFamily: FONT.nova, letterSpacing: -0.3 },
  dateTap: { alignItems: 'center' },
  dateTapPressed: { opacity: 0.82 },
  datePill: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: { fontSize: 12, fontWeight: '700', marginLeft: 6 },
  summaryWrap: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  summary: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
  },
  chipVal: { fontSize: 15, fontWeight: '800' },
  chipLbl: { fontSize: 9, marginTop: 3, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  section: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 2,
  },
  scroll: { padding: 16, paddingBottom: 28 },
  exCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  exInner: { padding: 14 },
  exHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exTitle: { fontSize: 16, fontWeight: '700' },
  exSub: { fontSize: 11, marginTop: 2 },
  exCalBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  exCalNum: { fontSize: 18, fontWeight: '800' },
  exCalLbl: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  exDot: { width: 8, height: 8, borderRadius: 99 },
  exName: { fontSize: 14, fontWeight: '600' },
  exMeta: { fontSize: 12, marginTop: 2 },
});
