import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { X, Search, ScanLine, Mic, Plus, Clock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { themeColors, colors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import { searchFoods } from '../../data/foods';
import AiBadge from '../../components/common/AiBadge';
import { SafeAreaTop } from '../../components/common/ScreenShell';

export default function AddFoodScreen({ navigation, route }) {
  const meal = route.params?.meal || 'breakfast';
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { recentFoods, customFoods, addFood } = useDiary();
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const catalog = searchFoods(q);
    const customs = (customFoods || []).filter((f) => {
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return f.name.toLowerCase().includes(s) || (f.brand || '').toLowerCase().includes(s);
    });
    const merged = [...customs, ...catalog];
    const seen = new Set();
    return merged.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }, [q, customFoods]);

  const quickLog = (food) => {
    addFood(meal, food);
    navigation.navigate('Main', { screen: 'Diary' });
  };

  return (
    <View style={[styles.root, { backgroundColor: c.pageBg }]}>
      <SafeAreaTop color={c.pageBg} />
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
          placeholder="Search foods"
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
        <Pressable
          style={[styles.aiBtn, { backgroundColor: c.cardBg, borderColor: c.border }]}
          onPress={() => navigation.navigate('ManualFood', { meal })}
        >
          <Plus size={16} color={colors.primary} />
          <Text style={[styles.aiLbl, { color: c.text }]}>Create</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {!q.trim() && recentFoods?.length ? (
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <Clock size={14} color={c.muted} />
              <Text style={[styles.blockTitle, { color: c.muted, fontFamily: snPro('800') }]}>RECENT</Text>
            </View>
            {recentFoods.slice(0, 8).map((food) => (
              <Pressable
                key={`recent-${food.id}`}
                onPress={() => quickLog(food)}
                onLongPress={() => navigation.navigate('FoodDetail', { id: food.id, meal, food })}
                style={[styles.row, { backgroundColor: c.cardBg, borderColor: c.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: c.text }]}>{food.name}</Text>
                  <Text style={[styles.meta, { color: c.muted }]}>
                    {food.brand || 'Food'} · {food.serving}
                  </Text>
                </View>
                <Text style={[styles.cals, { color: c.text }]}>{food.calories}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={[styles.blockTitle, { color: c.muted, fontFamily: snPro('800'), marginBottom: 8 }]}>
          {q.trim() ? 'RESULTS' : 'ALL FOODS'}
        </Text>
        {results.map((food) => (
          <Pressable
            key={food.id}
            onPress={() => {
              if (String(food.id).startsWith('cf-')) {
                quickLog(food);
                return;
              }
              navigation.navigate('FoodDetail', { id: food.id, meal });
            }}
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
    </View>
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
  aiRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 12 },
  aiBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  aiLbl: { fontSize: 12, fontWeight: '700' },
  list: { padding: 20, paddingBottom: 32, gap: 8 },
  block: { marginBottom: 12, gap: 8 },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  blockTitle: { fontSize: 10, letterSpacing: 1 },
  row: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { fontSize: 15, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 2 },
  cals: { fontSize: 15, fontWeight: '800' },
});
