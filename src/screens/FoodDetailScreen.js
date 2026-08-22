import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { themeColors, colors } from '../config/colors';
import { FONT } from '../config/fonts';
import { getFoodById } from '../data/foods';

export default function FoodDetailScreen({ navigation, route }) {
  const { id, meal = 'breakfast' } = route.params || {};
  const food = getFoodById(id);
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { addFood } = useDiary();

  if (!food) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: c.pageBg }]}>
        <Text style={{ color: c.text, padding: 20 }}>Food not found.</Text>
      </SafeAreaView>
    );
  }

  const log = () => {
    addFood(meal, food);
    navigation.navigate('Main', { screen: 'Diary' });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.pageBg }]} edges={['top', 'bottom']}>
      <Pressable style={styles.back} onPress={() => navigation.goBack()}>
        <ChevronLeft size={22} color={c.text} />
        <Text style={[styles.backText, { color: c.text }]}>Back</Text>
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.name, { color: c.text }]}>{food.name}</Text>
        <Text style={[styles.brand, { color: c.muted }]}>{food.brand} · {food.serving}</Text>

        <View style={[styles.card, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <Text style={[styles.kcal, { color: c.text }]}>{food.calories}</Text>
          <Text style={[styles.kcalLbl, { color: c.muted }]}>calories</Text>
          <View style={styles.macros}>
            <Macro label="Carbs" value={food.carbs} color={colors.carbs} theme={c} />
            <Macro label="Protein" value={food.protein} color={colors.protein} theme={c} />
            <Macro label="Fat" value={food.fat} color={colors.fat} theme={c} />
          </View>
        </View>
      </View>

      <Pressable style={styles.cta} onPress={log}>
        <Text style={styles.ctaText}>Log to {meal}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function Macro({ label, value, color, theme }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={[styles.mVal, { color }]}>{value}g</Text>
      <Text style={[styles.mLbl, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 4 },
  backText: { fontSize: 16, fontWeight: '600' },
  body: { flex: 1, paddingHorizontal: 20 },
  name: { fontSize: 26, fontWeight: '400', fontFamily: FONT.nova },
  brand: { fontSize: 14, marginTop: 6, marginBottom: 20 },
  card: { borderRadius: 18, borderWidth: 1, padding: 20, alignItems: 'center' },
  kcal: { fontSize: 40, fontWeight: '800' },
  kcalLbl: { fontSize: 13, fontWeight: '600', marginBottom: 18 },
  macros: { flexDirection: 'row', width: '100%' },
  mVal: { fontSize: 18, fontWeight: '800' },
  mLbl: { fontSize: 12, marginTop: 4 },
  cta: {
    margin: 20,
    height: 52,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
