import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet } from 'react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader, { SaveButton } from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';

const GOALS = [
  { key: 'lose', label: 'Lose weight' },
  { key: 'maintain', label: 'Maintain' },
  { key: 'gain', label: 'Gain muscle' },
];

export default function ProfileEditScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { profile, updateProfile, goal, setGoal } = useDiary();
  const [name, setName] = useState(profile.name);
  const [selectedGoal, setSelectedGoal] = useState(goal);

  const save = () => {
    updateProfile({ name: name.trim() || profile.name });
    setGoal(selectedGoal);
    navigation.goBack();
  };

  return (
    <ScreenShell>
      <ScreenHeader
        title="Edit profile"
        onBack={() => navigation.goBack()}
        theme={c}
        right={<SaveButton onPress={save} />}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { fontFamily: snPro('800') }]}>
              {(name || profile.name).slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.hint, { color: c.muted }]}>Avatar uses your first initial</Text>
        </View>

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800') }]}>NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { color: c.text, backgroundColor: c.cardBg, borderColor: c.border, fontFamily: snPro('600') }]}
          placeholder="Your name"
          placeholderTextColor={c.muted}
        />

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800'), marginTop: 16 }]}>GOAL</Text>
        {GOALS.map((g) => {
          const on = selectedGoal === g.key;
          return (
            <Pressable
              key={g.key}
              onPress={() => setSelectedGoal(g.key)}
              style={[
                styles.goalRow,
                {
                  backgroundColor: c.cardBg,
                  borderColor: on ? colors.primary : c.border,
                },
              ]}
            >
              <Text style={[styles.goalLbl, { color: c.text, fontFamily: snPro('700') }]}>{g.label}</Text>
              <View style={[styles.radio, { borderColor: on ? colors.primary : c.border, backgroundColor: on ? colors.primary : 'transparent' }]} />
            </Pressable>
          );
        })}

        <View style={[styles.info, { backgroundColor: isDark ? '#1C1C1E' : c.chip }]}>
          <Text style={[styles.infoTitle, { color: c.text, fontFamily: FONT.nova }]}>Local profile</Text>
          <Text style={[styles.infoBody, { color: c.muted }]}>
            Changes stay on this device. Account sync will connect later.
          </Text>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  avatarWrap: { alignItems: 'center', marginBottom: 20 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 28 },
  hint: { fontSize: 12, marginTop: 8 },
  section: { fontSize: 10, letterSpacing: 1, marginBottom: 10 },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  goalLbl: { fontSize: 15 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 99,
    borderWidth: 2,
  },
  info: {
    marginTop: 20,
    borderRadius: 14,
    padding: 14,
  },
  infoTitle: { fontSize: 16, marginBottom: 4 },
  infoBody: { fontSize: 13, lineHeight: 19 },
});
