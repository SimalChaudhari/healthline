import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { X, Search, ScanLine, Mic } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { themeColors, colors } from '../config/colors';
import { FONT } from '../config/fonts';
import { searchFoods } from '../data/foods';
import AiBadge from '../components/AiBadge';

export default function AddFoodScreen({ navigation, route }) {
  const meal = route.params?.meal || 'breakfast';
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const [q, setQ] = useState('');
  const results = useMemo(() => searchFoods(q), [q]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.pageBg }]} edges={['top']}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: c.text }]}>Add food</Text>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <X size={22} color={c.text} />
        </Pressable>
      </View>
      <Text style={[styles.meal, { color: c.muted }]}>{labelMeal(meal)}</Text>

      <View style={[styles.search, { backgroundColor: c.cardBg, borderColor: c.border }]}>
        <Search size={16} color={c.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search 20M+ foods (sample list)"
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.text }]}
        />
      </View>

      <View style={styles.aiRow}>
        <Pressable
          style={[styles.aiBtn, { backgroundColor: c.cardBg, borderColor: c.border }]}
          onPress={() => navigation.navigate('ScanFood', { meal })}
        >
          <ScanLine size={16} color={colors.aiPurple} />
          <Text style={[styles.aiLbl, { color: c.text }]}>Scan</Text>
          <AiBadge />
        </Pressable>
        <Pressable
          style={[styles.aiBtn, { backgroundColor: c.cardBg, borderColor: c.border }]}
          onPress={() => navigation.navigate('VoiceLog', { meal })}
        >
          <Mic size={16} color={colors.aiPurple} />
          <Text style={[styles.aiLbl, { color: c.text }]}>Voice</Text>
          <AiBadge />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {results.map((food) => (
          <Pressable
            key={food.id}
            onPress={() => navigation.navigate('FoodDetail', { id: food.id, meal })}
            style={[styles.row, { backgroundColor: c.cardBg, borderColor: c.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: c.text }]}>{food.name}</Text>
              <Text style={[styles.meta, { color: c.muted }]}>
                {food.brand} · {food.serving}
              </Text>
            </View>
            <Text style={[styles.cals, { color: c.text }]}>{food.calories}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function labelMeal(meal) {
  return meal.charAt(0).toUpperCase() + meal.slice(1);
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: { fontSize: 22, fontWeight: '400', fontFamily: FONT.nova },
  meal: { paddingHorizontal: 20, marginTop: 4, marginBottom: 12, fontSize: 13, fontWeight: '600' },
  search: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: { flex: 1, fontSize: 15 },
  aiRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 12 },
  aiBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  aiLbl: { fontSize: 13, fontWeight: '700' },
  list: { padding: 20, paddingBottom: 32, gap: 8 },
  row: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 2 },
  cals: { fontSize: 16, fontWeight: '800' },
});
