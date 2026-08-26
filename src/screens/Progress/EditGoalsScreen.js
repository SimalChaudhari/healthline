import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader, { SaveButton } from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { colors, themeColors } from '../../config/colors';
import { snPro } from '../../config/fonts';

const GOALS = [
  { key: 'lose', label: 'Lose weight' },
  { key: 'maintain', label: 'Maintain' },
  { key: 'gain', label: 'Gain muscle' },
];

export default function EditGoalsScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { profile, updateProfile, goal, setGoal } = useDiary();

  const [calories, setCalories] = useState(String(profile.calories));
  const [protein, setProtein] = useState(String(profile.protein));
  const [carbs, setCarbs] = useState(String(profile.carbs));
  const [fat, setFat] = useState(String(profile.fat));
  const [waterGoal, setWaterGoal] = useState(String(profile.waterGoal));
  const [goalWeight, setGoalWeight] = useState(String(profile.goalWeight));
  const [selectedGoal, setSelectedGoal] = useState(goal);

  const save = () => {
    updateProfile({
      calories: Number(calories) || profile.calories,
      protein: Number(protein) || profile.protein,
      carbs: Number(carbs) || profile.carbs,
      fat: Number(fat) || profile.fat,
      waterGoal: Number(waterGoal) || profile.waterGoal,
      goalWeight: Number(goalWeight) || profile.goalWeight,
    });
    setGoal(selectedGoal);
    navigation.goBack();
  };

  return (
    <ScreenShell>
      <ScreenHeader
        title="Nutrition goals"
        onBack={() => navigation.goBack()}
        theme={c}
        right={<SaveButton onPress={save} />}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800') }]}>GOAL TYPE</Text>
        <View style={styles.goalRow}>
          {GOALS.map((g) => {
            const on = selectedGoal === g.key;
            return (
              <Pressable
                key={g.key}
                onPress={() => setSelectedGoal(g.key)}
                style={[
                  styles.goalChip,
                  {
                    backgroundColor: on ? colors.primary : isDark ? '#1C1C1E' : c.chip,
                    borderColor: on ? colors.primary : c.border,
                  },
                ]}
              >
                <Text style={[styles.goalChipText, { color: on ? '#FFF' : c.text, fontFamily: snPro('700') }]}>
                  {g.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800') }]}>DAILY TARGETS</Text>
        <Field label="Calories" value={calories} onChangeText={setCalories} suffix="kcal" theme={c} isDark={isDark} />
        <Field label="Protein" value={protein} onChangeText={setProtein} suffix="g" theme={c} isDark={isDark} />
        <Field label="Carbs" value={carbs} onChangeText={setCarbs} suffix="g" theme={c} isDark={isDark} />
        <Field label="Fat" value={fat} onChangeText={setFat} suffix="g" theme={c} isDark={isDark} />
        <Field label="Water glasses" value={waterGoal} onChangeText={setWaterGoal} suffix="cups" theme={c} isDark={isDark} />
        <Field label="Goal weight" value={goalWeight} onChangeText={setGoalWeight} suffix="kg" theme={c} isDark={isDark} />
      </ScrollView>
    </ScreenShell>
  );
}

function Field({ label, value, onChangeText, suffix, theme, isDark }) {
  return (
    <View style={[styles.field, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[styles.fieldLbl, { color: theme.muted, fontFamily: snPro('600') }]}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          style={[styles.input, { color: theme.text, backgroundColor: isDark ? '#1C1C1E' : theme.chip, fontFamily: snPro('700') }]}
        />
        <Text style={[styles.suffix, { color: theme.muted }]}>{suffix}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  section: { fontSize: 10, letterSpacing: 1, marginBottom: 10 },
  goalRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 18 },
  goalChip: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  goalChipText: { fontSize: 13 },
  field: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  fieldLbl: { fontSize: 12, marginBottom: 8 },
  fieldRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  suffix: { marginLeft: 10, fontSize: 13, fontWeight: '600', minWidth: 40 },
});
