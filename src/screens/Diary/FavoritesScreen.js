import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Heart, Plus } from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { useConfirm } from '../../context/ConfirmContext';
import { colors, themeColors } from '../../config/colors';
import { snPro } from '../../config/fonts';
import { FOODS, getFoodById } from '../../data/foods';

export default function FavoritesScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { favorites, toggleFavorite, addFood, customFoods } = useDiary();
  const { confirm } = useConfirm();

  const list = useMemo(
    () =>
      favorites
        .map((id) => getFoodById(id) || customFoods.find((f) => f.id === id))
        .filter(Boolean),
    [favorites, customFoods],
  );

  const logFood = (food) => {
    addFood('snacks', food);
    navigation.navigate('Main', { screen: 'Diary' });
  };

  const removeFavorite = async (food) => {
    const ok = await confirm({
      title: 'Remove favorite?',
      message: `Remove “${food.name}” from your favorites?`,
      confirmLabel: 'Remove',
      cancelLabel: 'Cancel',
    });
    if (ok) toggleFavorite(food.id);
  };

  return (
    <ScreenShell>
      <ScreenHeader title="Favorites" onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.sub, { color: c.muted }]}>
          Saved foods for quick logging. Tap heart to remove.
        </Text>

        {list.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <Heart size={28} color={c.muted} />
            <Text style={[styles.emptyTitle, { color: c.text, fontFamily: snPro('700') }]}>No favorites yet</Text>
            <Text style={[styles.emptySub, { color: c.muted }]}>Add from the list below.</Text>
          </View>
        ) : (
          list.map((food) => (
            <View key={food.id} style={[styles.card, { backgroundColor: c.cardBg, borderColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: c.text, fontFamily: snPro('700') }]}>{food.name}</Text>
                <Text style={[styles.meta, { color: c.muted }]}>
                  {food.brand} · {food.serving} · {food.calories} kcal
                </Text>
              </View>
              <Pressable onPress={() => removeFavorite(food)} hitSlop={8} style={styles.heart}>
                <Heart size={18} color={colors.danger} fill={colors.danger} />
              </Pressable>
              <Pressable onPress={() => logFood(food)} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                <Plus size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          ))
        )}

        <Text style={[styles.section, { color: c.muted, fontFamily: snPro('800') }]}>ADD MORE</Text>
        {FOODS.filter((f) => !favorites.includes(f.id)).slice(0, 8).map((food) => (
          <Pressable
            key={food.id}
            onPress={() => toggleFavorite(food.id)}
            style={[styles.card, { backgroundColor: c.cardBg, borderColor: c.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: c.text, fontFamily: snPro('600') }]}>{food.name}</Text>
              <Text style={[styles.meta, { color: c.muted }]}>{food.calories} kcal</Text>
            </View>
            <Heart size={18} color={c.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  sub: { fontSize: 14, marginBottom: 14, lineHeight: 20 },
  section: { fontSize: 10, letterSpacing: 1, marginTop: 16, marginBottom: 10 },
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 16, marginTop: 10 },
  emptySub: { fontSize: 13, marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  name: { fontSize: 15 },
  meta: { fontSize: 12, marginTop: 3 },
  heart: { marginHorizontal: 8 },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
