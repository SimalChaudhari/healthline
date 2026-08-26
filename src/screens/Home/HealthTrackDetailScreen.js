import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import AppButton from '../../components/common/AppButton';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import { getHealthTrack } from '../../data/healthTracks';

export default function HealthTrackDetailScreen({ navigation, route }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const track = getHealthTrack(route.params?.id);
  const [symptoms, setSymptoms] = useState({});
  const [saved, setSaved] = useState(false);

  if (!track) {
    return (
      <ScreenShell>
        <ScreenHeader title="Track" onBack={() => navigation.goBack()} theme={c} />
        <Text style={{ padding: 20, color: c.muted }}>Track not found.</Text>
      </ScreenShell>
    );
  }

  const toggle = (label) => setSymptoms((prev) => ({ ...prev, [label]: !prev[label] }));

  const logCheckin = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScreenShell>
      <ScreenHeader title={track.name} onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.headline, { color: c.text, fontFamily: FONT.nova }]}>{track.name}</Text>
        <Text style={[styles.sub, { color: c.muted }]}>{track.sub}</Text>

        {track.cycle ? (
          <View style={[styles.cycleCard, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <Text style={[styles.cycleLbl, { color: c.muted, fontFamily: snPro('800') }]}>CYCLE</Text>
            <Text style={[styles.cycleVal, { color: c.text, fontFamily: FONT.nova }]}>Day 14 · follicular</Text>
            <Text style={[styles.cycleHint, { color: c.muted }]}>Targets adjust by phase when cycle logging is on.</Text>
          </View>
        ) : null}

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800') }]}>TODAY&apos;S SYMPTOMS</Text>
        <View style={styles.symptomRow}>
          {track.symptoms.map((s) => {
            const on = !!symptoms[s];
            return (
              <Pressable
                key={s}
                onPress={() => toggle(s)}
                style={[
                  styles.symptomChip,
                  {
                    backgroundColor: on ? colors.primary : c.chip,
                    borderColor: on ? colors.primary : c.border,
                  },
                ]}
              >
                <Text style={[styles.symptomText, { color: on ? '#FFFFFF' : c.text, fontFamily: snPro('600') }]}>{s}</Text>
              </Pressable>
            );
          })}
        </View>

        <AppButton label={saved ? 'Check-in saved' : 'Log check-in'} onPress={logCheckin} style={{ marginTop: 4 }} />

        <View style={styles.twoCol}>
          <View style={[styles.listCard, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <Text style={[styles.listTitle, { color: colors.accent, fontFamily: snPro('800') }]}>EAT MORE</Text>
            {track.eat.map((item) => (
              <Text key={item} style={[styles.listItem, { color: c.text }]}>· {item}</Text>
            ))}
          </View>
          <View style={[styles.listCard, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <Text style={[styles.listTitle, { color: colors.danger, fontFamily: snPro('800') }]}>LIMIT</Text>
            {track.limit.map((item) => (
              <Text key={item} style={[styles.listItem, { color: c.text }]}>· {item}</Text>
            ))}
          </View>
        </View>

        <View style={[styles.insight, { backgroundColor: isDark ? '#1A2744' : colors.primarySoft, borderColor: c.border }]}>
          <Text style={[styles.insightLbl, { color: colors.primary, fontFamily: snPro('800') }]}>COACH INSIGHT</Text>
          <Text style={[styles.insightText, { color: c.text, fontFamily: snPro('500') }]}>{track.insight}</Text>
        </View>

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800') }]}>METRICS</Text>
        {track.metrics.map(([label, sub, val]) => (
          <View key={label} style={[styles.metricRow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <View>
              <Text style={[styles.metricLabel, { color: c.text, fontFamily: snPro('700') }]}>{label}</Text>
              <Text style={[styles.metricSub, { color: c.muted }]}>{sub}</Text>
            </View>
            <Text style={[styles.metricVal, { color: colors.primary, fontFamily: snPro('800') }]}>{val}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  headline: { fontSize: 24 },
  sub: { fontSize: 13, marginTop: 6, marginBottom: 16, lineHeight: 20 },
  cycleCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  cycleLbl: { fontSize: 10, letterSpacing: 0.8 },
  cycleVal: { fontSize: 24, marginTop: 4 },
  cycleHint: { fontSize: 12, marginTop: 6 },
  section: { fontSize: 10, letterSpacing: 1, marginTop: 16, marginBottom: 10 },
  symptomRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  symptomChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 99, borderWidth: 1 },
  symptomText: { fontSize: 12 },
  twoCol: { flexDirection: 'row', gap: 10, marginTop: 16 },
  listCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14 },
  listTitle: { fontSize: 10, letterSpacing: 0.8, marginBottom: 10 },
  listItem: { fontSize: 12, lineHeight: 18, marginBottom: 4 },
  insight: { borderRadius: 16, borderWidth: 1, padding: 14, marginTop: 16 },
  insightLbl: { fontSize: 10, letterSpacing: 0.8, marginBottom: 8 },
  insightText: { fontSize: 13, lineHeight: 20 },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  metricLabel: { fontSize: 14 },
  metricSub: { fontSize: 11, marginTop: 2 },
  metricVal: { fontSize: 16 },
});
