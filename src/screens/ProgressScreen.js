import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Scale,
  Flame,
  Droplets,
  Footprints,
  Trophy,
  TrendingDown,
  Target,
  Dumbbell,
  Award,
} from 'lucide-react-native';
import ScreenShell from '../components/ScreenShell';
import ProgressRing from '../components/ProgressRing';
import MacroBar from '../components/MacroBar';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { colors, themeColors } from '../config/colors';
import { FONT, snPro } from '../config/fonts';

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEK_CALS = [1980, 2210, 2050, 1870, 2140, 2400, null];
const WEIGHT_TREND = [74.2, 73.8, 73.5, 73.1, 72.9, 72.7, 72.5, 72.4];
const WATER_WEEK = [6, 7, 8, 6, 7, 8, null];

const GOAL_LABEL = {
  lose: 'Lose weight',
  maintain: 'Maintain',
  gain: 'Gain muscle',
};

const ACHIEVEMENTS = [
  { id: 'streak', label: '6-day streak', Icon: Flame, color: colors.carbs },
  { id: 'protein', label: 'Protein focus', Icon: Target, color: colors.protein },
  { id: 'water', label: 'Hydration', Icon: Droplets, color: colors.primary },
  { id: 'steps', label: '10k steps', Icon: Footprints, color: colors.exercise },
];

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 2 },
  default: {},
});

export default function ProgressScreen() {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { profile, totals, remaining, burned, water, goal, exercise } = useDiary();

  const weekCalories = useMemo(() => {
    const data = [...WEEK_CALS];
    data[6] = totals.calories;
    return data;
  }, [totals.calories]);

  const weekWater = useMemo(() => {
    const data = [...WATER_WEEK];
    data[6] = water;
    return data;
  }, [water]);

  const maxCals = Math.max(...weekCalories, profile.calories);
  const avgCals = Math.round(weekCalories.reduce((s, v) => s + v, 0) / 7);
  const weekAdherence = Math.round((avgCals / profile.calories) * 100);
  const exerciseMins = exercise.reduce((s, e) => s + (e.minutes || 0), 0);
  const weightDelta = (profile.weight - WEIGHT_TREND[0]).toFixed(1);
  const waterAvg = Math.round(weekWater.reduce((s, v) => s + v, 0) / 7);

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: colors.primary, fontFamily: snPro('800') }]}>PROGRESS</Text>
        <Text style={[styles.title, { color: c.text }]}>Your week at a glance</Text>
        <Text style={[styles.sub, { color: c.muted }]}>
          Track weight, calories, macros, water, and activity. Sample data for the client UI.
        </Text>

        <View style={[styles.heroCard, cardShadow, { borderColor: isDark ? c.border : 'rgba(0,112,224,0.14)' }]}>
          <LinearGradient
            colors={isDark ? ['#161616', '#121212'] : ['#FFFFFF', '#F0F7FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroInner}
          >
            <View style={styles.heroTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroKicker, { color: colors.primary, fontFamily: snPro('700') }]}>
                  WEEKLY AVERAGE
                </Text>
                <Text style={[styles.heroVal, { color: c.text }]}>{avgCals}</Text>
                <Text style={[styles.heroMeta, { color: c.muted }]}>
                  kcal / day · {weekAdherence}% of {profile.calories} goal
                </Text>
              </View>
              <ProgressRing
                progress={Math.min(1, avgCals / profile.calories)}
                color={colors.primary}
                trackColor={isDark ? '#2A2A2A' : '#DCEBFA'}
                size={88}
                stroke={8}
              >
                <Text style={[styles.ringPct, { color: c.text, fontFamily: snPro('800') }]}>{weekAdherence}%</Text>
              </ProgressRing>
            </View>
            <View style={[styles.goalPill, { backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft }]}>
              <Target size={14} color={colors.primary} />
              <Text style={[styles.goalPillText, { color: colors.primary, fontFamily: snPro('600') }]}>
                {GOAL_LABEL[goal]} · {profile.goalWeight} kg target
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statGrid}>
          <StatCard
            Icon={Scale}
            label="Weight"
            value={`${profile.weight} kg`}
            hint={`${weightDelta} kg this month`}
            hintColor={colors.accent}
            theme={c}
            isDark={isDark}
            iconColor={colors.primary}
          />
          <StatCard
            Icon={Flame}
            label="Streak"
            value="6 days"
            hint="Keep logging"
            hintColor={c.muted}
            theme={c}
            isDark={isDark}
            iconColor={colors.carbs}
          />
          <StatCard
            Icon={Footprints}
            label="Steps today"
            value="8,420"
            hint="Avg 8.9k this week"
            hintColor={c.muted}
            theme={c}
            isDark={isDark}
            iconColor={colors.exercise}
          />
          <StatCard
            Icon={Dumbbell}
            label="Exercise"
            value={`${exerciseMins} min`}
            hint={`${burned} kcal burned`}
            hintColor={colors.exercise}
            theme={c}
            isDark={isDark}
            iconColor={colors.exercise}
          />
        </View>

        <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Calories this week</Text>
            <Text style={[styles.cardMeta, { color: c.muted }]}>Goal {profile.calories}</Text>
          </View>
          <View style={styles.bars}>
            {weekCalories.map((cals, i) => {
              const h = Math.max(8, Math.round((cals / maxCals) * 110));
              const atGoal = cals <= profile.calories;
              return (
                <View key={`cal-${i}`} style={styles.barCol}>
                  <Text style={[styles.barVal, { color: c.muted, fontFamily: snPro('600') }]}>
                    {cals > 999 ? `${Math.round(cals / 100) / 10}k` : cals}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: c.track, height: 110 }]}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: h,
                          backgroundColor: i === 6 ? colors.primary : atGoal ? colors.accent : colors.primarySoft,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLbl, { color: i === 6 ? colors.primary : c.muted }]}>{WEEK_LABELS[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <View style={styles.cardHead}>
            <View style={styles.cardHeadLeft}>
              <TrendingDown size={16} color={colors.accent} />
              <Text style={[styles.cardTitleInline, { color: c.text }]}>Weight trend</Text>
            </View>
            <Text style={[styles.cardMeta, { color: colors.accent, fontFamily: snPro('700') }]}>
              −{Math.abs(Number(weightDelta))} kg
            </Text>
          </View>
          <View style={styles.weightBars}>
            {WEIGHT_TREND.map((w, i) => {
              const minW = Math.min(...WEIGHT_TREND, profile.goalWeight) - 0.5;
              const maxW = Math.max(...WEIGHT_TREND) + 0.3;
              const h = Math.max(10, Math.round(((w - minW) / (maxW - minW)) * 72));
              return (
                <View key={`wt-${i}`} style={styles.weightCol}>
                  <View style={[styles.weightTrack, { backgroundColor: c.track, height: 72 }]}>
                    <View
                      style={[
                        styles.weightFill,
                        {
                          height: h,
                          backgroundColor: i === WEIGHT_TREND.length - 1 ? colors.primary : colors.primarySoft,
                        },
                      ]}
                    />
                  </View>
                  {i % 2 === 1 ? (
                    <Text style={[styles.weightLbl, { color: c.muted }]}>{w}</Text>
                  ) : (
                    <Text style={[styles.weightLbl, { color: 'transparent' }]}>.</Text>
                  )}
                </View>
              );
            })}
          </View>
          <Text style={[styles.cardMeta, { color: c.muted, marginTop: 8 }]}>
            8-week trend · goal {profile.goalWeight} kg
          </Text>
        </View>

        <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Macro progress today</Text>
          <MacroBar
            label="Protein"
            current={totals.protein}
            goal={profile.protein}
            color={colors.protein}
            textColor={c.text}
            muted={c.muted}
          />
          <View style={{ height: 12 }} />
          <MacroBar
            label="Carbs"
            current={totals.carbs}
            goal={profile.carbs}
            color={colors.carbs}
            textColor={c.text}
            muted={c.muted}
          />
          <View style={{ height: 12 }} />
          <MacroBar
            label="Fat"
            current={totals.fat}
            goal={profile.fat}
            color={colors.fat}
            textColor={c.text}
            muted={c.muted}
          />
        </View>

        <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <View style={styles.cardHead}>
            <View style={styles.cardHeadLeft}>
              <Droplets size={16} color={colors.primary} />
              <Text style={[styles.cardTitleInline, { color: c.text }]}>Water intake</Text>
            </View>
            <Text style={[styles.cardMeta, { color: c.muted }]}>{waterAvg}/8 avg · goal {profile.waterGoal}</Text>
          </View>
          <View style={styles.waterRow}>
            {weekWater.map((glasses, i) => {
              const fillH = Math.round(Math.min(64, (glasses / profile.waterGoal) * 64));
              return (
                <View key={`w-${i}`} style={styles.waterCol}>
                  <View style={[styles.waterTrack, { backgroundColor: c.track, height: 64 }]}>
                    <View
                      style={[
                        styles.waterFill,
                        {
                          height: fillH,
                          backgroundColor: i === 6 ? colors.primary : colors.primarySoft,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLbl, { color: i === 6 ? colors.primary : c.muted }]}>{WEEK_LABELS[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Today vs goal</Text>
          <Row label="Calories left" value={`${Math.max(0, remaining)}`} theme={c} />
          <Row label="Food logged" value={`${totals.calories} kcal`} theme={c} />
          <Row label="Exercise" value={`${burned} kcal`} theme={c} />
          <Row label="Protein" value={`${totals.protein} / ${profile.protein}g`} theme={c} />
          <Row label="Carbs" value={`${totals.carbs} / ${profile.carbs}g`} theme={c} />
          <Row label="Fat" value={`${totals.fat} / ${profile.fat}g`} theme={c} last />
        </View>

        <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <View style={styles.cardHead}>
            <View style={styles.cardHeadLeft}>
              <Trophy size={16} color={colors.carbs} />
              <Text style={[styles.cardTitleInline, { color: c.text }]}>Achievements</Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            {ACHIEVEMENTS.map(({ id, label, Icon, color }) => (
              <View key={id} style={styles.badgeWrap}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: isDark ? '#1C1C1E' : '#F8FAFC', borderColor: c.border },
                  ]}
                >
                  <View style={[styles.badgeIcon, { backgroundColor: `${color}22` }]}>
                    <Icon size={16} color={color} />
                  </View>
                  <Text style={[styles.badgeLbl, { color: c.text, fontFamily: snPro('600') }]}>{label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.insightCard, { backgroundColor: isDark ? '#1A2744' : colors.primarySoft, borderColor: isDark ? '#2A3A5C' : 'rgba(0,112,224,0.15)' }]}>
          <Award size={18} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.insightTitle, { color: c.text, fontFamily: snPro('700') }]}>Weekly insight</Text>
            <Text style={[styles.insightBody, { color: c.muted }]}>
              You are {Math.max(0, remaining)} kcal under goal today. Protein is at{' '}
              {Math.round((totals.protein / profile.protein) * 100)}% — add a lean snack to close the gap.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

function StatCard({ Icon, label, value, hint, hintColor, theme, isDark, iconColor }) {
  return (
    <View style={styles.statWrap}>
      <View style={[styles.stat, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={[styles.statIcon, { backgroundColor: isDark ? '#1C1C1E' : `${iconColor}18` }]}>
          <Icon size={16} color={iconColor} />
        </View>
        <Text style={[styles.statLbl, { color: theme.muted, fontFamily: snPro('600') }]}>{label}</Text>
        <Text style={[styles.statVal, { color: theme.text, fontFamily: snPro('800') }]}>{value}</Text>
        <Text style={[styles.statHint, { color: hintColor, fontFamily: snPro('600') }]}>{hint}</Text>
      </View>
    </View>
  );
}

function Row({ label, value, theme, last }) {
  return (
    <View style={[styles.kv, { borderTopColor: theme.border, borderBottomWidth: last ? 0 : 0 }]}>
      <Text style={[styles.k, { color: theme.muted }]}>{label}</Text>
      <Text style={[styles.v, { color: theme.text, fontFamily: snPro('700') }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 36 },
  kicker: { fontSize: 11, letterSpacing: 1 },
  title: { fontSize: 26, marginTop: 4, fontFamily: FONT.nova },
  sub: { fontSize: 14, marginTop: 6, marginBottom: 16, lineHeight: 20 },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  heroInner: { padding: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroKicker: { fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase' },
  heroVal: { fontSize: 32, fontFamily: FONT.nova, marginTop: 4 },
  heroMeta: { fontSize: 12, marginTop: 4 },
  ringPct: { fontSize: 16 },
  goalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
  },
  goalPillText: { fontSize: 12, marginLeft: 6 },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
    marginBottom: 6,
  },
  statWrap: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  stat: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLbl: { fontSize: 12 },
  statVal: { fontSize: 20, marginTop: 4 },
  statHint: { fontSize: 11, marginTop: 4 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardHeadLeft: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontFamily: snPro('700'), marginBottom: 14 },
  cardTitleInline: { fontSize: 16, fontFamily: snPro('700'), marginLeft: 8 },
  cardMeta: { fontSize: 12 },
  bars: { flexDirection: 'row', alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center' },
  barVal: { fontSize: 9, marginBottom: 4 },
  barTrack: {
    width: 18,
    borderRadius: 99,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: { width: '100%', borderRadius: 99 },
  barLbl: { fontSize: 11, marginTop: 6, fontWeight: '600' },
  weightBars: { flexDirection: 'row', alignItems: 'flex-end' },
  weightCol: { flex: 1, alignItems: 'center' },
  weightTrack: {
    width: 12,
    borderRadius: 99,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  weightFill: { width: '100%', borderRadius: 99 },
  weightLbl: { fontSize: 9, marginTop: 6 },
  waterRow: { flexDirection: 'row' },
  waterCol: { flex: 1, alignItems: 'center' },
  waterTrack: {
    width: 14,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  waterFill: { width: '100%', borderRadius: 8 },
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  k: { fontSize: 14 },
  v: { fontSize: 14 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  badgeWrap: { width: '50%', paddingHorizontal: 4, marginBottom: 8 },
  badge: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  badgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeLbl: { fontSize: 12 },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  insightTitle: { fontSize: 14, marginBottom: 4 },
  insightBody: { fontSize: 13, lineHeight: 19 },
});
