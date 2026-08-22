import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanLine, Mic, Search, Droplets, Flame, ChevronRight, Plus } from 'lucide-react-native';
import ScreenShell from '../components/ScreenShell';
import ProgressRing from '../components/ProgressRing';
import ProfileMenu from '../components/ProfileMenu';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { colors, themeColors } from '../config/colors';
import { FONT } from '../config/fonts';

export default function DashboardScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { profile, totals, remaining, burned, water, addWater, dateKey, exercise } = useDiary();
  const eaten = totals.calories;
  const goal = profile.calories;
  const progress = Math.min(1, eaten / goal);
  const pctEaten = Math.round(progress * 100);
  const waterPct = profile.waterGoal > 0 ? Math.min(100, Math.round((water / profile.waterGoal) * 100)) : 0;
  const waterAtGoal = water >= profile.waterGoal;
  const topExercise = exercise[0];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ScreenShell>
      <ProfileMenu visible={menuOpen} onClose={() => setMenuOpen(false)} navigation={navigation} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.hello, { color: c.muted }]}>Good day, {profile.name}</Text>
            <Text style={[styles.title, { color: c.text }]}>Today</Text>
            <Text style={[styles.date, { color: c.muted }]}>{formatDate(dateKey)}</Text>
          </View>
          <Pressable
            onPress={() => setMenuOpen(true)}
            style={({ pressed }) => [
              styles.avatar,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Text style={styles.avatarText}>{profile.name.slice(0, 1)}</Text>
          </Pressable>
        </View>

        <View style={[styles.heroCard, cardShadow, { borderColor: isDark ? c.border : 'rgba(0,112,224,0.14)' }]}>
          <LinearGradient
            colors={isDark ? ['#161616', '#121212'] : ['#FFFFFF', '#F0F7FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroInner}
          >
            <Text style={[styles.heroKicker, { color: colors.primary }]}>DAILY SUMMARY</Text>

            <View style={styles.ringWrap}>
              <ProgressRing
                progress={progress}
                color={colors.primary}
                trackColor={isDark ? '#2A2A2A' : '#DCEBFA'}
                size={184}
                stroke={12}
              >
                <Text style={[styles.remainNum, { color: c.text }]}>{Math.max(0, remaining)}</Text>
                <Text style={[styles.remainLbl, { color: c.muted }]}>cals remaining</Text>
                <View style={[styles.pctPill, { backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft }]}>
                  <Text style={[styles.pctText, { color: colors.primary }]}>{pctEaten}% eaten</Text>
                </View>
              </ProgressRing>
            </View>

            <View style={styles.statRow}>
              <StatChip label="Goal" value={goal} theme={c} isDark={isDark} />
              <StatChip label="Food" value={eaten} theme={c} isDark={isDark} accent={colors.primary} />
              <StatChip label="Exercise" value={burned} theme={c} isDark={isDark} accent={colors.exercise} />
            </View>

            <View style={[styles.macroPanel, { backgroundColor: isDark ? '#1C1C1E' : 'rgba(255,255,255,0.72)', borderColor: isDark ? c.border : 'rgba(0,112,224,0.1)' }]}>
              <Text style={[styles.macroTitle, { color: c.muted }]}>MACROS</Text>
              <View style={styles.macroCols}>
                <MacroColumn label="Carbs" current={totals.carbs} goal={profile.carbs} color={colors.carbs} theme={c} isDark={isDark} />
                <MacroColumn label="Protein" current={totals.protein} goal={profile.protein} color={colors.protein} theme={c} isDark={isDark} />
                <MacroColumn label="Fat" current={totals.fat} goal={profile.fat} color={colors.fat} theme={c} isDark={isDark} />
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text style={[styles.section, { color: c.text }]}>Quick log</Text>
        <View style={styles.quickRow}>
          <QuickAction
            icon={ScanLine}
            label="Scan meal"
            theme={c}
            iconColor={colors.primary}
            ai
            onPress={() => navigation.navigate('ScanFood', { meal: 'lunch' })}
          />
          <QuickAction
            icon={Mic}
            label="Voice log"
            theme={c}
            iconColor={colors.aiPurple}
            ai
            onPress={() => navigation.navigate('VoiceLog', { meal: 'snacks' })}
          />
          <QuickAction
            icon={Search}
            label="Search"
            theme={c}
            iconColor={colors.primary}
            onPress={() => navigation.navigate('AddFood', { meal: 'breakfast' })}
          />
        </View>

        <View style={[styles.wellnessCard, cardShadow, { borderColor: isDark ? c.border : 'rgba(0,112,224,0.12)' }]}>
          <LinearGradient
            colors={isDark ? ['#141414', '#121212'] : ['#FFFFFF', '#F0F8FF']}
            style={styles.wellnessInner}
          >
            <View style={styles.waterHead}>
              <View style={styles.waterTitle}>
                <View style={[styles.waterIcon, { backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft }]}>
                  <Droplets size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.wellnessKicker, { color: colors.primary }]}>HYDRATION</Text>
                  <Text style={[styles.waterLbl, { color: c.text }]}>Water</Text>
                </View>
              </View>
              <View style={[styles.waterPctBadge, { backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft }]}>
                <Text style={[styles.waterPctText, { color: colors.primary }]}>{waterPct}%</Text>
              </View>
            </View>

            <View style={styles.waterMeta}>
              <Text style={[styles.waterBig, { color: c.text }]}>
                {water}
                <Text style={[styles.waterSmall, { color: c.muted }]}> / {profile.waterGoal} glasses</Text>
              </Text>
              {!waterAtGoal ? (
                <Text style={[styles.waterHint, { color: c.muted }]}>
                  {profile.waterGoal - water} more to reach your goal
                </Text>
              ) : (
                <Text style={[styles.waterHint, { color: colors.primary }]}>Daily goal complete</Text>
              )}
            </View>

            <View style={styles.glasses}>
              {Array.from({ length: profile.waterGoal }).map((_, i) => (
                <WaterGlass
                  key={`glass-${i}`}
                  filled={i < water}
                  isDark={isDark}
                  track={isDark ? '#2A2A2A' : '#E8F0F8'}
                />
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.waterBtn,
                waterAtGoal
                  ? { backgroundColor: isDark ? '#1C1C1E' : '#E8F0F8', opacity: 0.9 }
                  : {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.9 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
              ]}
              onPress={addWater}
              disabled={waterAtGoal}
            >
              {!waterAtGoal ? <Plus size={16} color="#FFFFFF" strokeWidth={2.5} /> : null}
              <Text style={[styles.waterBtnText, waterAtGoal && { color: c.muted }]}>
                {waterAtGoal ? 'Goal reached' : 'Add glass'}
              </Text>
            </Pressable>
          </LinearGradient>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Diary')}
          style={({ pressed }) => [
            styles.wellnessCard,
            cardShadow,
            { borderColor: isDark ? c.border : 'rgba(52,199,89,0.2)', opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <LinearGradient
            colors={isDark ? ['#141414', '#121212'] : ['#FFFFFF', '#F0FFF5']}
            style={styles.wellnessInner}
          >
            <View style={styles.exRow}>
              <View style={[styles.exIcon, { backgroundColor: isDark ? '#1C1C1E' : colors.accentSoft }]}>
                <Flame size={18} color={colors.exercise} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.wellnessKicker, { color: colors.exercise }]}>ACTIVITY</Text>
                <Text style={[styles.exTitle, { color: c.text }]}>Exercise</Text>
                {topExercise ? (
                  <Text style={[styles.exSub, { color: c.muted }]}>
                    {topExercise.name} · {topExercise.minutes} min
                  </Text>
                ) : (
                  <Text style={[styles.exSub, { color: c.muted }]}>No workouts logged yet</Text>
                )}
              </View>
              <View style={styles.exRight}>
                <Text style={[styles.exCal, { color: colors.exercise }]}>{burned}</Text>
                <Text style={[styles.exCalLbl, { color: c.muted }]}>kcal</Text>
                <View style={[styles.exChev, { backgroundColor: isDark ? '#1C1C1E' : colors.accentSoft }]}>
                  <ChevronRight size={16} color={colors.exercise} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

function WaterGlass({ filled, isDark, track }) {
  const shellBorder = isDark ? '#3A3A3C' : '#C5D8EB';
  return (
    <View
      style={[
        styles.glassShell,
        {
          backgroundColor: track,
          borderColor: filled ? colors.primary : shellBorder,
        },
      ]}
    >
      <View
        style={[
          styles.glassFill,
          {
            height: filled ? '88%' : '0%',
            backgroundColor: filled ? colors.primary : 'transparent',
          },
        ]}
      />
      {filled ? <View style={styles.glassShine} /> : null}
    </View>
  );
}

function StatChip({ label, value, theme, isDark, accent }) {
  return (
    <View
      style={[
        styles.statChip,
        {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderColor: isDark ? theme.border : 'rgba(0,112,224,0.12)',
        },
      ]}
    >
      <Text style={[styles.statVal, { color: accent || theme.text }]}>{value}</Text>
      <Text style={[styles.statLbl, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

function MacroColumn({ label, current, goal, color, theme, isDark }) {
  const pct = goal > 0 ? Math.min(1, current / goal) : 0;
  return (
    <View style={styles.macroCol}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={[styles.macroVal, { color: theme.text }]}>{Math.round(current)}g</Text>
      <Text style={[styles.macroLbl, { color: theme.muted }]}>{label}</Text>
      <View style={[styles.macroTrack, { backgroundColor: isDark ? '#2A2A2A' : `${color}22` }]}>
        <View style={[styles.macroFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.macroGoal, { color: theme.muted }]}>/ {goal}g</Text>
    </View>
  );
}

function QuickAction({ icon: Icon, label, theme, iconColor, ai, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quick,
        cardShadow,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <Icon size={22} color={iconColor} strokeWidth={2} />
      <Text style={[styles.quickLbl, { color: theme.text }]} numberOfLines={1}>
        {label}
      </Text>
      {ai ? (
        <View style={styles.aiTag}>
          <Text style={styles.aiTagText}>AI</Text>
        </View>
      ) : (
        <View style={styles.aiTagSpacer} />
      )}
    </Pressable>
  );
}

function formatDate(key) {
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 2 },
  default: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
});

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 36 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  hello: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  title: {
    fontSize: 30,
    fontWeight: '400',
    letterSpacing: -0.5,
    fontFamily: FONT.nova,
  },
  date: { fontSize: 13, marginTop: 2 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18,
  },
  heroInner: { padding: 18, paddingBottom: 16 },
  heroKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  ringWrap: { alignItems: 'center', paddingVertical: 6 },
  remainNum: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  remainLbl: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  pctPill: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  pctText: { fontSize: 11, fontWeight: '700' },
  statRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 14,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
  },
  statVal: { fontSize: 17, fontWeight: '800' },
  statLbl: { fontSize: 10, marginTop: 3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  macroPanel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  macroTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  macroCols: { flexDirection: 'row', gap: 10 },
  macroCol: { flex: 1, alignItems: 'center' },
  macroDot: { width: 6, height: 6, borderRadius: 99, marginBottom: 6 },
  macroVal: { fontSize: 15, fontWeight: '800' },
  macroLbl: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  macroTrack: {
    width: '100%',
    height: 5,
    borderRadius: 99,
    marginTop: 8,
    overflow: 'hidden',
  },
  macroFill: { height: 5, borderRadius: 99 },
  macroGoal: { fontSize: 10, marginTop: 4, fontWeight: '500' },
  section: { fontSize: 17, fontWeight: '800', marginBottom: 10, letterSpacing: -0.2 },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  quick: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    minHeight: 96,
    gap: 6,
  },
  quickLbl: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  aiTag: {
    backgroundColor: colors.aiSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.aiPurple,
    letterSpacing: 0.3,
  },
  aiTagSpacer: {
    height: 17,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  wellnessCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  wellnessInner: { padding: 16 },
  wellnessKicker: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  waterHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  waterTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  waterIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterLbl: { fontSize: 16, fontWeight: '700' },
  waterPctBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  waterPctText: { fontSize: 12, fontWeight: '800' },
  waterMeta: { marginTop: 14, marginBottom: 4 },
  waterBig: { fontSize: 22, fontWeight: '800' },
  waterSmall: { fontSize: 14, fontWeight: '600' },
  waterHint: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  glasses: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
    marginBottom: 6,
    alignItems: 'flex-end',
  },
  glassShell: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  glassFill: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  glassShine: {
    position: 'absolute',
    top: 6,
    left: 4,
    width: 4,
    height: 10,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  waterBtn: {
    marginTop: 12,
    borderRadius: 14,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  waterBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  exRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exTitle: { fontSize: 16, fontWeight: '700' },
  exSub: { fontSize: 12, marginTop: 3 },
  exRight: { alignItems: 'flex-end', gap: 2 },
  exCal: { fontSize: 22, fontWeight: '800', lineHeight: 24 },
  exCalLbl: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  exChev: {
    width: 28,
    height: 28,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
});
