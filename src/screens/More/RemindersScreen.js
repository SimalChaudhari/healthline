import React from 'react';
import { View, Text, ScrollView, Switch, StyleSheet, Pressable } from 'react-native';
import { Bell, Coffee, Utensils, Moon, Droplets, Scale, Cookie, Dumbbell, NotebookPen, CalendarDays } from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { colors, themeColors } from '../../config/colors';
import { snPro } from '../../config/fonts';

const ITEMS = [
  { key: 'breakfast', label: 'Breakfast reminder', sub: '8:00 AM', Icon: Coffee, color: colors.carbs },
  { key: 'lunch', label: 'Lunch reminder', sub: '12:30 PM', Icon: Utensils, color: colors.primary },
  { key: 'dinner', label: 'Dinner reminder', sub: '7:00 PM', Icon: Moon, color: colors.protein },
  { key: 'snack', label: 'Snack reminder', sub: '4:00 PM', Icon: Cookie, color: colors.aiPurple },
  { key: 'water', label: 'Water nudge', sub: 'Every 2 hours', Icon: Droplets, color: colors.primary },
  { key: 'exercise', label: 'Exercise reminder', sub: '6:00 PM', Icon: Dumbbell, color: colors.exercise },
  { key: 'foodLog', label: 'Food logging reminder', sub: 'After meals', Icon: NotebookPen, color: colors.primary },
  { key: 'mealPlan', label: 'Meal planning reminder', sub: 'Sunday evening', Icon: CalendarDays, color: colors.accent },
  { key: 'weighIn', label: 'Weekly weigh-in', sub: 'Sunday morning', Icon: Scale, color: colors.accent },
];

export default function RemindersScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { reminders, updateReminder } = useDiary();
  const onCount = Object.values(reminders).filter(Boolean).length;

  return (
    <ScreenShell>
      <ScreenHeader title="Reminders" onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.banner, { backgroundColor: isDark ? '#1A2744' : colors.primarySoft, borderColor: c.border }]}>
          <Bell size={18} color={colors.primary} />
          <Text style={[styles.bannerText, { color: c.text, fontFamily: snPro('600') }]}>
            {onCount} reminders on · local UI only (no push yet)
          </Text>
        </View>

        {ITEMS.map(({ key, label, sub, Icon, color }) => (
          <Pressable
            key={key}
            onPress={() => updateReminder(key, !reminders[key])}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: c.cardBg, borderColor: c.border, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <View style={[styles.icon, { backgroundColor: isDark ? '#1C1C1E' : `${color}22` }]}>
              <Icon size={18} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: c.text, fontFamily: snPro('700') }]}>{label}</Text>
              <Text style={[styles.sub, { color: c.muted }]}>{sub}</Text>
            </View>
            <Switch
              value={!!reminders[key]}
              pointerEvents="none"
              trackColor={{ false: isDark ? '#3A3A3C' : '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </Pressable>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  bannerText: { marginLeft: 10, fontSize: 13, flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: { fontSize: 15 },
  sub: { fontSize: 12, marginTop: 2 },
});
