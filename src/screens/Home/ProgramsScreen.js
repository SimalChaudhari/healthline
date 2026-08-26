import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ChevronRight, Play } from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import { ACTIVE_PROGRAM_ID, PROGRAM_GROUPS, getProgramProgress } from '../../data/programs';

export default function ProgramsScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const active = PROGRAM_GROUPS.flatMap((g) => g.programs).find((p) => p.id === ACTIVE_PROGRAM_ID);
  const progress = getProgramProgress(ACTIVE_PROGRAM_ID);

  return (
    <ScreenShell>
      <ScreenHeader title="Programs" onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.headline, { color: c.text, fontFamily: FONT.nova }]}>Programs</Text>
        <Text style={[styles.sub, { color: c.muted }]}>
          Step-by-step tracks with short video lessons. Nutrition targets move with them.
        </Text>

        {active ? (
          <Pressable
            onPress={() => navigation.navigate('ProgramDetail', { id: active.id })}
            style={[styles.hero, { backgroundColor: isDark ? '#1A2744' : colors.primary }]}
          >
            <Text style={styles.heroKicker}>IN PROGRESS</Text>
            <Text style={styles.heroTitle}>{active.title}</Text>
            <Text style={styles.heroSub}>
              Week 2 of {active.weeks} · next session: core & cardio, 22 min
            </Text>
            <View style={styles.heroTrack}>
              <View style={[styles.heroFill, { width: `${Math.round(progress.pct * 100)}%` }]} />
            </View>
          </Pressable>
        ) : null}

        {PROGRAM_GROUPS.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={[styles.groupTitle, { color: c.text, fontFamily: snPro('700') }]}>{group.title}</Text>
            <Text style={[styles.groupSub, { color: c.muted }]}>{group.sub}</Text>
            {group.programs.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => navigation.navigate('ProgramDetail', { id: p.id })}
                style={[styles.card, { backgroundColor: c.cardBg, borderColor: c.border }]}
              >
                <View style={[styles.playIcon, { backgroundColor: isDark ? c.chip : colors.primarySoft }]}>
                  <Play size={16} color={colors.primary} fill={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: c.text, fontFamily: snPro('700') }]}>{p.title}</Text>
                  <Text style={[styles.cardMeta, { color: c.muted }]}>{p.meta}</Text>
                  <Text style={[styles.status, { color: p.status === 'Active' ? colors.primary : c.muted, fontFamily: snPro('600') }]}>
                    {p.status}
                  </Text>
                </View>
                <ChevronRight size={18} color={c.muted} />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  headline: { fontSize: 26 },
  sub: { fontSize: 13, marginTop: 4, marginBottom: 16, lineHeight: 18 },
  hero: { borderRadius: 18, padding: 16, marginBottom: 20 },
  heroKicker: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  heroTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginTop: 6 },
  heroSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12.5, marginTop: 4 },
  heroTrack: { height: 5, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 14, overflow: 'hidden' },
  heroFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 99 },
  group: { marginBottom: 20 },
  groupTitle: { fontSize: 15 },
  groupSub: { fontSize: 12, marginTop: 3, marginBottom: 10, lineHeight: 17 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  playIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 14 },
  cardMeta: { fontSize: 11.5, marginTop: 2 },
  status: { fontSize: 11, marginTop: 4 },
});
