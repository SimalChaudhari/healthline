import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Check, Play } from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import { getProgramById, getProgramProgress, PROGRAM_SESSIONS } from '../../data/programs';

export default function ProgramDetailScreen({ navigation, route }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const program = getProgramById(route.params?.id);
  const [sessionId, setSessionId] = useState(null);

  if (!program) {
    return (
      <ScreenShell>
        <ScreenHeader title="Program" onBack={() => navigation.goBack()} theme={c} />
        <Text style={{ padding: 20, color: c.muted }}>Program not found.</Text>
      </ScreenShell>
    );
  }

  const sessions = PROGRAM_SESSIONS[program.id] || [];
  const progress = getProgramProgress(program.id);
  const activeSession = sessions.find((s) => s.id === sessionId);

  return (
    <ScreenShell>
      <ScreenHeader title={program.title} onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.cover, { backgroundColor: isDark ? '#1C1C1E' : c.chip }]}>
          <Play size={32} color={colors.primary} fill={colors.primary} />
          <Text style={[styles.coverLbl, { color: c.muted }]}>Program preview</Text>
        </View>

        <Text style={[styles.headline, { color: c.text, fontFamily: FONT.nova }]}>{program.title}</Text>
        <Text style={[styles.sub, { color: c.muted }]}>
          {program.weeks} weeks · {program.sessionsPerWeek} sessions a week · video lessons
        </Text>

        <View style={[styles.track, { backgroundColor: c.chip }]}>
          <View style={[styles.trackFill, { width: `${Math.round(progress.pct * 100)}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressLbl, { color: c.muted }]}>
          {progress.done} of {progress.total || sessions.length} sessions complete
        </Text>

        {activeSession ? (
          <View style={[styles.player, { backgroundColor: isDark ? '#1C1C1E' : '#111827', borderColor: c.border }]}>
            <View style={styles.playBtn}>
              <View style={styles.playTriangle} />
            </View>
            <Text style={styles.playerTitle}>{activeSession.title}</Text>
            <Text style={styles.playerMeta}>Week {activeSession.week} · {activeSession.duration}</Text>
          </View>
        ) : null}

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800') }]}>SESSIONS</Text>
        {sessions.length === 0 ? (
          <Text style={[styles.empty, { color: c.muted }]}>Sessions coming soon for this program.</Text>
        ) : (
          sessions.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => setSessionId(s.id)}
              style={[styles.session, { backgroundColor: c.cardBg, borderColor: sessionId === s.id ? colors.primary : c.border }]}
            >
              <View style={[styles.sessionIcon, { backgroundColor: s.done ? colors.primary : isDark ? c.chip : colors.primarySoft }]}>
                {s.done ? <Check size={14} color="#FFFFFF" /> : <Play size={12} color={colors.primary} fill={colors.primary} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sessionTitle, { color: c.text, fontFamily: snPro('700') }]}>{s.title}</Text>
                <Text style={[styles.sessionMeta, { color: c.muted }]}>Week {s.week} · {s.duration}</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  cover: {
    height: 140,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  coverLbl: { fontSize: 11, marginTop: 8 },
  headline: { fontSize: 24 },
  sub: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  track: { height: 5, borderRadius: 99, overflow: 'hidden', marginTop: 14 },
  trackFill: { height: '100%', borderRadius: 99 },
  progressLbl: { fontSize: 12, marginTop: 6, marginBottom: 16 },
  player: {
    borderRadius: 18,
    borderWidth: 1,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 16,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: '#111827',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
  playerTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 12 },
  playerMeta: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 4 },
  section: { fontSize: 10, letterSpacing: 1, marginBottom: 10 },
  empty: { fontSize: 13, marginBottom: 12 },
  session: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  sessionIcon: {
    width: 32,
    height: 32,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTitle: { fontSize: 14 },
  sessionMeta: { fontSize: 11, marginTop: 2 },
});
