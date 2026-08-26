import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { ChevronRight, HeartPulse } from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import { TRACK_LIST } from '../../data/healthTracks';

export default function HealthTracksScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);

  return (
    <ScreenShell>
      <ScreenHeader title="Health tracks" onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.headline, { color: c.text, fontFamily: FONT.nova }]}>Health tracks</Text>
        <Text style={[styles.sub, { color: c.muted }]}>
          Tell Healthline what you are managing. It changes your targets, warnings, and weekly check-ins.
        </Text>

        {TRACK_LIST.map((track) => (
          <Pressable
            key={track.id}
            onPress={() => navigation.navigate('HealthTrackDetail', { id: track.id })}
            style={[styles.card, { backgroundColor: c.cardBg, borderColor: c.border }]}
          >
            <View style={[styles.chip, { backgroundColor: isDark ? 'rgba(0,112,224,0.25)' : colors.primarySoft }]}>
              <Text style={[styles.chipText, { color: colors.primary, fontFamily: snPro('700') }]}>{track.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: c.text, fontFamily: snPro('700') }]}>{track.name}</Text>
              <Text style={[styles.meta, { color: c.muted }]} numberOfLines={2}>
                {track.sub}
              </Text>
              {track.cycle ? (
                <Text style={[styles.badge, { color: colors.aiPurple, fontFamily: snPro('600') }]}>Cycle-aware</Text>
              ) : null}
            </View>
            <ChevronRight size={18} color={c.muted} />
          </Pressable>
        ))}

        <View style={[styles.tip, { backgroundColor: isDark ? '#1A2744' : colors.primarySoft, borderColor: c.border }]}>
          <HeartPulse size={18} color={colors.primary} />
          <Text style={[styles.tipText, { color: c.muted, fontFamily: snPro('500') }]}>
            These tracks adjust nutrition targets locally. Not a substitute for medical care.
          </Text>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  headline: { fontSize: 26 },
  sub: { fontSize: 13, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  chip: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 13 },
  name: { fontSize: 15 },
  meta: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  badge: { fontSize: 11, marginTop: 6 },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
