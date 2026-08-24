import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import { Dumbbell, Trash2 } from 'lucide-react-native';
import ScreenShell from '../components/ScreenShell';
import ScreenHeader from '../components/ScreenHeader';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { useConfirm } from '../context/ConfirmContext';
import { colors, themeColors } from '../config/colors';
import { snPro } from '../config/fonts';

const PRESETS = [
  { name: 'Walk', minutes: 30, calories: 140 },
  { name: 'Run', minutes: 25, calories: 280 },
  { name: 'Cycling', minutes: 40, calories: 320 },
  { name: 'Strength', minutes: 45, calories: 220 },
  { name: 'Yoga', minutes: 30, calories: 120 },
];

export default function LogExerciseScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { exercise, addExercise, removeExercise, burned } = useDiary();
  const { confirm } = useConfirm();
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('30');
  const [calories, setCalories] = useState('150');

  const handleRemove = async (item) => {
    const ok = await confirm({
      title: 'Delete exercise?',
      message: `Remove “${item.name}” (${item.minutes} min · ${item.calories} kcal)? This cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
    if (ok) removeExercise(item.logId);
  };

  const applyPreset = (p) => {
    setName(p.name);
    setMinutes(String(p.minutes));
    setCalories(String(p.calories));
  };

  const save = () => {
    if (!name.trim()) return;
    addExercise({
      name: name.trim(),
      minutes: Number(minutes) || 0,
      calories: Number(calories) || 0,
    });
    navigation.goBack();
  };

  return (
    <ScreenShell>
      <ScreenHeader title="Log exercise" onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.summary, { backgroundColor: isDark ? '#1A2744' : colors.primarySoft, borderColor: c.border }]}>
          <Dumbbell size={18} color={colors.exercise} />
          <Text style={[styles.summaryText, { color: c.text, fontFamily: snPro('700') }]}>
            {burned} kcal burned today · {exercise.length} workouts
          </Text>
        </View>

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800') }]}>QUICK ADD</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presets}>
          {PRESETS.map((p) => (
            <Pressable
              key={p.name}
              onPress={() => applyPreset(p)}
              style={[styles.preset, { backgroundColor: c.cardBg, borderColor: c.border }]}
            >
              <Text style={[styles.presetName, { color: c.text, fontFamily: snPro('700') }]}>{p.name}</Text>
              <Text style={[styles.presetMeta, { color: c.muted }]}>{p.minutes}m · {p.calories} kcal</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800') }]}>CUSTOM</Text>
        <Field label="Activity" value={name} onChangeText={setName} theme={c} isDark={isDark} placeholder="e.g. Swim" />
        <Field label="Minutes" value={minutes} onChangeText={setMinutes} theme={c} isDark={isDark} keyboardType="number-pad" />
        <Field label="Calories" value={calories} onChangeText={setCalories} theme={c} isDark={isDark} keyboardType="number-pad" />

        <Pressable onPress={save} style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}>
          <Text style={[styles.ctaText, { fontFamily: snPro('700') }]}>Add to diary</Text>
        </Pressable>

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800'), marginTop: 20 }]}>TODAY</Text>
        {exercise.length === 0 ? (
          <Text style={[styles.empty, { color: c.muted }]}>No exercise logged yet.</Text>
        ) : (
          exercise.map((item) => (
            <View key={item.logId} style={[styles.row, { backgroundColor: c.cardBg, borderColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: c.text, fontFamily: snPro('700') }]}>{item.name}</Text>
                <Text style={[styles.rowMeta, { color: c.muted }]}>
                  {item.minutes} min · {item.calories} kcal
                </Text>
              </View>
              <Pressable onPress={() => handleRemove(item)} hitSlop={8}>
                <Trash2 size={16} color={colors.danger} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenShell>
  );
}

function Field({ label, value, onChangeText, theme, isDark, placeholder, keyboardType }) {
  return (
    <View style={[styles.field, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[styles.fieldLbl, { color: theme.muted, fontFamily: snPro('600') }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        keyboardType={keyboardType || 'default'}
        style={[styles.input, { color: theme.text, backgroundColor: isDark ? '#1C1C1E' : theme.chip, fontFamily: snPro('600') }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  summaryText: { marginLeft: 10, fontSize: 13, flex: 1 },
  section: { fontSize: 10, letterSpacing: 1, marginBottom: 10 },
  presets: { paddingBottom: 14 },
  preset: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginRight: 10,
    minWidth: 110,
  },
  presetName: { fontSize: 14 },
  presetMeta: { fontSize: 11, marginTop: 4 },
  field: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  fieldLbl: { fontSize: 12, marginBottom: 8 },
  input: { height: 44, borderRadius: 12, paddingHorizontal: 12, fontSize: 15 },
  cta: {
    height: 52,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  ctaText: { color: '#FFFFFF', fontSize: 16 },
  empty: { fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  rowTitle: { fontSize: 15 },
  rowMeta: { fontSize: 12, marginTop: 2 },
});
