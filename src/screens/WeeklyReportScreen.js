import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { Award, Flame, Droplets, Scale, Dumbbell } from 'lucide-react-native';
import ScreenShell from '../components/ScreenShell';
import ScreenHeader from '../components/ScreenHeader';
import ProgressRing from '../components/ProgressRing';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { colors, themeColors } from '../config/colors';
import { FONT, snPro } from '../config/fonts';

const WEEK_CALS = [1980, 2210, 2050, 1870, 2140, 2400];
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyReportScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { profile, totals, burned, water, weightLogs, exercise, goal } = useDiary();

  const week = useMemo(() => [...WEEK_CALS, totals.calories], [totals.calories]);
  const avg = Math.round(week.reduce((s, v) => s + v, 0) / 7);
  const adherence = Math.round((avg / profile.calories) * 100);
  const max = Math.max(...week, profile.calories);
  const weightDelta =
    weightLogs.length >= 2
      ? (weightLogs[0].weight - weightLogs[weightLogs.length - 1].weight).toFixed(1)
      : '0.0';
  const exerciseMins = exercise.reduce((s, e) => s + (e.minutes || 0), 0);

  return (
    <ScreenShell>
      <ScreenHeader title="Weekly report" onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sub, { color: c.muted }]}>
          Sample weekly summary for the client UI. Live history will bind later.
        </Text>

        <View style={[styles.hero, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.primary, fontFamily: snPro('700') }]}>7-DAY AVERAGE</Text>
            <Text style={[styles.heroVal, { color: c.text, fontFamily: FONT.nova }]}>{avg}</Text>
            <Text style={[styles.heroMeta, { color: c.muted }]}>kcal / day · {adherence}% of goal</Text>
          </View>
          <ProgressRing
            progress={Math.min(1, avg / profile.calories)}
            color={colors.primary}
            trackColor={isDark ? '#2A2A2A' : '#DCEBFA'}
            size={84}
            stroke={8}
          >
            <Text style={[styles.ringPct, { color: c.text, fontFamily: snPro('800') }]}>{adherence}%</Text>
          </ProgressRing>
        </View>

        <View style={styles.statGrid}>
          <Stat icon={Scale} label="Weight" value={`${weightDelta} kg`} hint="this week" color={colors.accent} theme={c} isDark={isDark} />
          <Stat icon={Flame} label="Food avg" value={`${avg}`} hint="kcal/day" color={colors.primary} theme={c} isDark={isDark} />
          <Stat icon={Dumbbell} label="Exercise" value={`${exerciseMins}m`} hint={`${burned} kcal today`} color={colors.exercise} theme={c} isDark={isDark} />
          <Stat icon={Droplets} label="Water" value={`${water}`} hint={`of ${profile.waterGoal} today`} color={colors.primary} theme={c} isDark={isDark} />
        </View>

        <View style={[styles.card, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text, fontFamily: snPro('700') }]}>Calories by day</Text>
          <View style={styles.bars}>
            {week.map((cals, i) => {
              const h = Math.max(8, Math.round((cals / max) * 100));
              return (
                <View key={WEEK_LABELS[i]} style={styles.barCol}>
                  <View style={[styles.barTrack, { backgroundColor: c.track, height: 100 }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: h,
                          backgroundColor: i === 6 ? colors.primary : colors.primarySoft,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLbl, { color: i === 6 ? colors.primary : c.muted }]}>
                    {WEEK_LABELS[i].slice(0, 1)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.insight, { backgroundColor: isDark ? '#1A2744' : colors.primarySoft, borderColor: c.border }]}>
          <Award size={18} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.insightTitle, { color: c.text, fontFamily: snPro('700') }]}>Insight</Text>
            <Text style={[styles.insightBody, { color: c.muted }]}>
              Goal: {goal}. You averaged {avg} kcal this week
              {adherence <= 105 ? ' — solid control.' : ' — slightly over; trim evening snacks.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

function Stat({ icon: Icon, label, value, hint, color, theme, isDark }) {
  return (
    <View style={styles.statWrap}>
      <View style={[styles.stat, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={[styles.statIcon, { backgroundColor: isDark ? '#1C1C1E' : `${color}18` }]}>
          <Icon size={16} color={color} />
        </View>
        <Text style={[styles.statLbl, { color: theme.muted, fontFamily: snPro('600') }]}>{label}</Text>
        <Text style={[styles.statVal, { color: theme.text, fontFamily: snPro('800') }]}>{value}</Text>
        <Text style={[styles.statHint, { color: theme.muted }]}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  sub: { fontSize: 14, marginBottom: 14, lineHeight: 20 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({ android: { elevation: 1 }, default: {} }),
  },
  kicker: { fontSize: 10, letterSpacing: 0.8 },
  heroVal: { fontSize: 32, marginTop: 4 },
  heroMeta: { fontSize: 12, marginTop: 4 },
  ringPct: { fontSize: 14 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, marginBottom: 4 },
  statWrap: { width: '50%', paddingHorizontal: 5, marginBottom: 10 },
  stat: { borderRadius: 14, borderWidth: 1, padding: 12 },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLbl: { fontSize: 11 },
  statVal: { fontSize: 18, marginTop: 2 },
  statHint: { fontSize: 11, marginTop: 2 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 15, marginBottom: 14 },
  bars: { flexDirection: 'row', alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center' },
  barTrack: {
    width: 16,
    borderRadius: 99,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: { width: '100%', borderRadius: 99 },
  barLbl: { fontSize: 11, marginTop: 6, fontWeight: '600' },
  insight: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  insightTitle: { fontSize: 14, marginBottom: 4 },
  insightBody: { fontSize: 13, lineHeight: 19 },
});
