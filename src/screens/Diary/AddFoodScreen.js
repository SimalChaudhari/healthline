import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import {
  X,
  Search,
  ScanLine,
  Mic,
  Plus,
  Clock,
  Barcode,
  LayoutGrid,
  Star,
  Heart,
  UtensilsCrossed,
  Apple,
  Coffee,
  Beef,
  Wheat,
  Droplet,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { themeColors, colors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import { searchFoods, FOODS } from '../../data/foods';
import { SafeAreaTop } from '../../components/common/ScreenShell';

const TABS = [
  { id: 'all', label: 'All', Icon: LayoutGrid },
  { id: 'common', label: 'Common', Icon: Star },
  { id: 'favorites', label: 'Favorites', Icon: Heart },
  { id: 'barcode', label: 'Barcode', Icon: Barcode },
];

const cardShadow = Platform.select({
  ios: { shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  android: { elevation: 1 },
  default: {},
});

export default function AddFoodScreen({ navigation, route }) {
  const meal = route.params?.meal || 'breakfast';
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { recentFoods, customFoods, favorites, addFood } = useDiary();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');

  const results = useMemo(() => {
    if (tab === 'barcode') return [];

    let pool = [];
    if (tab === 'favorites') {
      pool = favorites || [];
    } else if (tab === 'common') {
      pool = FOODS.filter((f) =>
        (f.tags || []).some((t) => ['breakfast', 'lunch', 'high-protein', 'snack', 'fruit'].includes(t)),
      );
    } else {
      const catalog = searchFoods(q);
      const customs = (customFoods || []).filter((f) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return f.name.toLowerCase().includes(s) || (f.brand || '').toLowerCase().includes(s);
      });
      pool = [...customs, ...catalog];
    }

    if (tab !== 'all' && q.trim()) {
      const s = q.toLowerCase();
      pool = pool.filter(
        (f) => f.name.toLowerCase().includes(s) || (f.brand || '').toLowerCase().includes(s),
      );
    }

    const seen = new Set();
    return pool.filter((f) => {
      if (seen.has(f.id)) return false;
      seen.add(f.id);
      return true;
    });
  }, [q, customFoods, tab, favorites]);

  const quickLog = (food) => {
    addFood(meal, food);
    navigation.navigate('Main', { screen: 'Diary' });
  };

  const onTab = (id) => {
    if (id === 'barcode') {
      navigation.navigate('BarcodeScan', { meal });
      return;
    }
    setTab(id);
  };

  const listTitle =
    q.trim() ? 'Results' : tab === 'favorites' ? 'Favorites' : tab === 'common' ? 'Common foods' : 'All foods';

  return (
    <View style={[styles.root, { backgroundColor: c.pageBg }]}>
      <SafeAreaTop color={c.pageBg} />

      <View style={styles.head}>
        <View>
          <Text style={[styles.title, { color: c.text, fontFamily: FONT.nova }]}>Add food</Text>
          <Text style={[styles.meal, { color: c.muted, fontFamily: snPro('600') }]}>{labelMeal(meal)}</Text>
        </View>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={[styles.closeBtn, { backgroundColor: c.chip, borderColor: c.border }]}
        >
          <X size={20} color={c.text} />
        </Pressable>
      </View>

      <View style={[styles.search, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
        <Search size={18} color={c.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search foods"
          placeholderTextColor={c.placeholder}
          style={[styles.input, { color: c.text, fontFamily: snPro('400') }]}
        />
      </View>

      <View style={[styles.tabBar, { backgroundColor: isDark ? c.elevated : c.chip, borderColor: c.border }]}>
        {TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.Icon;
          return (
            <Pressable
              key={t.id}
              onPress={() => onTab(t.id)}
              style={[
                styles.tab,
                active && {
                  backgroundColor: c.cardBg,
                  borderColor: colors.primary,
                  ...cardShadow,
                },
              ]}
            >
              <Icon size={15} color={active ? colors.primary : c.muted} strokeWidth={2.2} />
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLbl,
                  {
                    color: active ? colors.primary : c.text,
                    fontFamily: snPro(active ? '700' : '600'),
                  },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actionRow}>
        <ActionTile
          icon={ScanLine}
          label="Scan"
          color={colors.aiPurple}
          theme={c}
          ai
          onPress={() => navigation.navigate('ScanFood', { meal })}
        />
        <ActionTile
          icon={Mic}
          label="Voice"
          color={colors.aiPurple}
          theme={c}
          ai
          onPress={() => navigation.navigate('VoiceLog', { meal })}
        />
        <ActionTile
          icon={Plus}
          label="Create"
          color={colors.primary}
          theme={c}
          onPress={() => navigation.navigate('ManualFood', { meal })}
        />
      </View>

      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!q.trim() && tab === 'all' && recentFoods?.length ? (
          <View style={styles.block}>
            <SectionLabel icon={Clock} label="Recent" theme={c} />
            {recentFoods.slice(0, 6).map((food) => (
              <FoodRow
                key={`recent-${food.id}`}
                food={food}
                theme={c}
                isDark={isDark}
                onPress={() => navigation.navigate('FoodDetail', { id: food.id, meal, food })}
                onAdd={() => quickLog(food)}
              />
            ))}
          </View>
        ) : null}

        {tab !== 'barcode' ? (
          <>
            <SectionLabel label={listTitle} theme={c} />
            {results.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: c.cardBg, borderColor: c.border }]}>
                <UtensilsCrossed size={28} color={c.muted} strokeWidth={1.8} />
                <Text style={[styles.emptyTitle, { color: c.text, fontFamily: snPro('700') }]}>
                  {tab === 'favorites' ? 'No favorites yet' : 'No foods found'}
                </Text>
                <Text style={[styles.emptySub, { color: c.muted, fontFamily: snPro('400') }]}>
                  {tab === 'favorites'
                    ? 'Heart a food on its detail page to save it here.'
                    : 'Try another search or switch tabs.'}
                </Text>
              </View>
            ) : (
              results.map((food) => (
                <FoodRow
                  key={food.id}
                  food={food}
                  theme={c}
                  isDark={isDark}
                  onPress={() => {
                    if (String(food.id).startsWith('cf-')) {
                      quickLog(food);
                      return;
                    }
                    navigation.navigate('FoodDetail', { id: food.id, meal });
                  }}
                  onAdd={() => quickLog(food)}
                />
              ))
            )}
          </>
        ) : (
          <Pressable
            onPress={() => navigation.navigate('BarcodeScan', { meal })}
            style={[styles.barcodeCard, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}
          >
            <View style={[styles.barcodeIcon, { backgroundColor: `${colors.primary}14` }]}>
              <Barcode size={28} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.barcodeTitle, { color: c.text, fontFamily: snPro('700') }]}>
              Scan or upload barcode
            </Text>
            <Text style={[styles.barcodeSub, { color: c.muted, fontFamily: snPro('400') }]}>
              Packaged food nutrition loads after a successful scan
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

function ActionTile({ icon: Icon, label, color, theme, ai, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionTile,
        cardShadow,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: `${color}14` }]}>
        <Icon size={18} color={color} strokeWidth={2.2} />
      </View>
      <Text style={[styles.actionLbl, { color: theme.text, fontFamily: snPro('700') }]}>{label}</Text>
      {ai ? (
        <View style={styles.aiTag}>
          <Sparkles size={9} color="#FFFFFF" />
          <Text style={styles.aiTagText}>AI</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function SectionLabel({ icon: Icon, label, theme }) {
  return (
    <View style={styles.sectionHead}>
      {Icon ? <Icon size={14} color={theme.muted} strokeWidth={2} /> : null}
      <Text style={[styles.sectionLbl, { color: theme.muted, fontFamily: snPro('800') }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

function foodIconFor(food) {
  const tags = (food.tags || []).map((t) => String(t).toLowerCase());
  if (tags.some((t) => t.includes('fruit'))) return Apple;
  if (tags.includes('breakfast')) return Coffee;
  if (tags.includes('high-protein')) return Beef;
  if (tags.includes('condiment')) return Droplet;
  return UtensilsCrossed;
}

function FoodRow({ food, theme, isDark, onPress, onAdd }) {
  const Icon = foodIconFor(food);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        cardShadow,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.border,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
    >
      <View style={[styles.thumb, { backgroundColor: isDark ? theme.elevated : `${colors.primary}10` }]}>
        <Icon size={22} color={colors.primary} strokeWidth={2} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.name, { color: theme.text, fontFamily: snPro('700') }]} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={[styles.meta, { color: theme.muted, fontFamily: snPro('400') }]} numberOfLines={1}>
          {food.brand || 'Food'} · {food.serving}
        </Text>
        <View style={styles.macroRow}>
          <MacroPill icon={Beef} value={food.protein} color={colors.protein} />
          <MacroPill icon={Wheat} value={food.carbs} color={colors.carbs} />
          <MacroPill icon={Droplet} value={food.fat} color={colors.fat} />
        </View>
      </View>
      <View style={styles.rightCol}>
        <Text style={[styles.cals, { color: theme.text, fontFamily: snPro('800') }]}>{food.calories}</Text>
        <Text style={[styles.calsLbl, { color: theme.muted, fontFamily: snPro('500') }]}>kcal</Text>
        <Pressable
          onPress={(e) => {
            e?.stopPropagation?.();
            onAdd?.();
          }}
          hitSlop={8}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function MacroPill({ icon: Icon, value, color }) {
  return (
    <View style={[styles.macroPill, { backgroundColor: `${color}16` }]}>
      <Icon size={10} color={color} strokeWidth={2.5} />
      <Text style={[styles.macroPillText, { color, fontFamily: snPro('700') }]}>
        {Math.round(value || 0)}g
      </Text>
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: { fontSize: 24, letterSpacing: -0.4 },
  meal: { fontSize: 13, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 3,
    minHeight: 52,
  },
  tabLbl: { fontSize: 10, textAlign: 'center' },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  actionTile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLbl: { fontSize: 12 },
  aiTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.aiPurple,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 99,
  },
  aiTagText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700' },
  listScroll: { flex: 1, marginTop: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 10 },
  block: { gap: 10, marginBottom: 8 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  sectionLbl: { fontSize: 10, letterSpacing: 1.1 },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 15, marginTop: 4 },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  barcodeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  barcodeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeTitle: { fontSize: 16, marginTop: 4 },
  barcodeSub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  row: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowBody: { flex: 1, minWidth: 0 },
  name: { fontSize: 15 },
  meta: { fontSize: 12, marginTop: 2 },
  macroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  macroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 99,
  },
  macroPillText: { fontSize: 10 },
  rightCol: { alignItems: 'flex-end', gap: 2, flexShrink: 0 },
  cals: { fontSize: 16 },
  calsLbl: { fontSize: 10 },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
});
