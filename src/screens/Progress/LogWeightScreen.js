import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { Scale } from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import AppButton from '../../components/common/AppButton';

export default function LogWeightScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { profile, weightLogs, addWeightLog } = useDiary();
  const [weight, setWeight] = useState(String(profile.weight));

  const save = () => {
    addWeightLog(weight);
    navigation.goBack();
  };

  return (
    <ScreenShell>
      <ScreenHeader title="Log weight" onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <View style={[styles.icon, { backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft }]}>
            <Scale size={22} color={colors.primary} />
          </View>
          <Text style={[styles.currentLbl, { color: c.muted, fontFamily: snPro('600') }]}>Current</Text>
          <Text style={[styles.currentVal, { color: c.text, fontFamily: FONT.nova }]}>{profile.weight} kg</Text>
          <Text style={[styles.goalHint, { color: colors.accent, fontFamily: snPro('600') }]}>
            Goal {profile.goalWeight} kg
          </Text>
        </View>

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800') }]}>TODAY'S WEIGH-IN</Text>
        <View style={[styles.inputCard, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            style={[styles.input, { color: c.text, fontFamily: snPro('800') }]}
            placeholder="0.0"
            placeholderTextColor={c.placeholder}
          />
          <Text style={[styles.unit, { color: c.muted }]}>kg</Text>
        </View>

        <AppButton label="Save weight" onPress={save} />

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800'), marginTop: 20 }]}>HISTORY</Text>
        {weightLogs.map((log) => (
          <View key={log.id} style={[styles.row, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <Text style={[styles.rowDate, { color: c.muted, fontFamily: snPro('500') }]}>{formatDate(log.date)}</Text>
            <Text style={[styles.rowVal, { color: c.text, fontFamily: snPro('700') }]}>{log.weight} kg</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

function formatDate(key) {
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  hero: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  currentLbl: { fontSize: 12 },
  currentVal: { fontSize: 36, marginTop: 4 },
  goalHint: { fontSize: 13, marginTop: 6 },
  section: { fontSize: 10, letterSpacing: 1, marginBottom: 10 },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 24 },
  unit: { fontSize: 16, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  rowDate: { fontSize: 13 },
  rowVal: { fontSize: 15 },
});
