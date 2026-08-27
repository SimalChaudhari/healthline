import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import {
  UtensilsCrossed,
  ScanLine,
  Flame,
  PieChart,
  Droplets,
  Dumbbell,
  Scale,
  ChartLine,
  Salad,
  CalendarDays,
  Sparkles,
  Bell,
  Barcode,
} from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { getBrandContent } from '../../config/brandContent';
import { featureColors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';

const FEATURES = [
  { id: 'food', label: 'Food Tracking', Icon: UtensilsCrossed, color: featureColors.foodTracking, route: 'AddFood', params: { meal: 'breakfast' } },
  { id: 'scan', label: 'Meal Scanner', Icon: ScanLine, color: featureColors.mealScanner, route: 'ScanFood', params: { meal: 'lunch' } },
  { id: 'cal', label: 'Calorie Counter', Icon: Flame, color: featureColors.calorieCounter, route: 'Diary' },
  { id: 'macro', label: 'Macro Tracking', Icon: PieChart, color: featureColors.macroTracking, route: 'Progress' },
  { id: 'water', label: 'Water Tracker', Icon: Droplets, color: featureColors.waterTracker, route: 'Dashboard' },
  { id: 'exercise', label: 'Exercise Log', Icon: Dumbbell, color: featureColors.exerciseLog, route: 'LogExercise', params: {} },
  { id: 'weight', label: 'Weight Tracker', Icon: Scale, color: featureColors.weightTracker, route: 'LogWeight' },
  { id: 'charts', label: 'Progress Charts', Icon: ChartLine, color: featureColors.progressCharts, route: 'Progress' },
  { id: 'recipes', label: 'Healthy Recipes', Icon: Salad, color: featureColors.healthyRecipes, route: 'Discover' },
  { id: 'planner', label: 'Meal Planner', Icon: CalendarDays, color: featureColors.mealPlanner, route: 'MealPlan' },
  { id: 'coach', label: 'AI Nutrition Coach', Icon: Sparkles, color: featureColors.aiCoach, route: 'Coach' },
  { id: 'reminders', label: 'Reminders', Icon: Bell, color: featureColors.reminders, route: 'Reminders' },
  { id: 'barcode', label: 'Barcode Scan', Icon: Barcode, color: featureColors.weightTracker, route: 'BarcodeScan', params: { meal: 'snacks' } },
];

const cardShadow = Platform.select({
  ios: { shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  android: { elevation: 2 },
  default: {},
});

export default function FeaturesHubScreen({ navigation }) {
  const { isDark, brand, colors } = useTheme();
  const c = themeColors(isDark);
  const content = getBrandContent(brand);

  const open = (item) => {
    if (item.route === 'Diary' || item.route === 'Discover' || item.route === 'Progress' || item.route === 'Dashboard') {
      navigation.navigate('Main', { screen: item.route });
      return;
    }
    navigation.navigate(item.route, item.params || {});
  };

  return (
    <ScreenShell>
      <ScreenHeader title="All features" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: colors.primary, fontFamily: snPro('800') }]}>
          {content.appName.toUpperCase()}
        </Text>
        <Text style={[styles.headline, { color: c.text, fontFamily: FONT.nova }]}>
          Everything in one place
        </Text>
        <Text style={[styles.sub, { color: c.muted, fontFamily: snPro('400') }]}>
          Tap a feature to jump straight in — full nutrition toolkit, themed for your color team.
        </Text>

        <View style={styles.grid}>
          {FEATURES.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => open(item)}
              style={({ pressed }) => [
                styles.tile,
                cardShadow,
                {
                  backgroundColor: c.cardBg,
                  borderColor: c.border,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${item.color}22` }]}>
                <item.Icon size={22} color={item.color} strokeWidth={2.2} />
              </View>
              <Text style={[styles.tileLbl, { color: c.text, fontFamily: snPro('600') }]} numberOfLines={2}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  kicker: { fontSize: 10, letterSpacing: 1.2, marginTop: 4 },
  headline: { fontSize: 26, marginTop: 6, letterSpacing: -0.5 },
  sub: { fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    minHeight: 108,
    gap: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLbl: { fontSize: 13, lineHeight: 17 },
});
