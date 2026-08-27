import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Flame,
  Plus,
  Minus,
  Heart,
  Utensils,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { themeColors, colors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import MacroBar from '../../components/common/MacroBar';
import MacroPieChart from '../../components/common/MacroPieChart';
import AvatarInitial from '../../components/common/AvatarInitial';
import { getFoodById } from '../../data/foods';
import { SafeAreaTop } from '../../components/common/ScreenShell';
import AppButton from '../../components/common/AppButton';

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 2 },
  default: {},
});

export default function FoodDetailScreen({ navigation, route }) {
  const { id, meal = 'breakfast', food: passedFood, barcode } = route.params || {};
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { addFood, profile, favorites, toggleFavorite, customFoods } = useDiary();
  const food =
    passedFood ||
    (customFoods || []).find((f) => f.id === id) ||
    getFoodById(id);
  const [servings, setServings] = useState(1);

  const scaled = useMemo(() => {
    if (!food) return null;
    return {
      calories: Math.round(food.calories * servings),
      carbs: Math.round(food.carbs * servings),
      protein: Math.round(food.protein * servings),
      fat: Math.round(food.fat * servings),
    };
  }, [food, servings]);

  if (!food || !scaled) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: c.pageBg }]}>
        <Text style={{ color: c.text, padding: 20 }}>Food not found.</Text>
      </SafeAreaView>
    );
  }

  const isFav = favorites?.includes(food.id);

  const adjust = (delta) => {
    setServings((s) => Math.min(10, Math.max(1, s + delta)));
  };

  const log = () => {
    addFood(meal, {
      ...food,
      calories: scaled.calories,
      carbs: scaled.carbs,
      protein: scaled.protein,
      fat: scaled.fat,
      serving: servings === 1 ? food.serving : `${servings} × ${food.serving}`,
    });
    navigation.navigate('Main', { screen: 'Diary' });
  };

  return (
    <View style={[styles.root, { backgroundColor: c.pageBg }]}>
      <SafeAreaTop color={c.pageBg} />
      <View style={styles.head}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: c.chip }]}
          hitSlop={8}
        >
          <ChevronLeft size={20} color={c.text} />
        </Pressable>
        <Text style={[styles.headTitle, { color: c.text, fontFamily: snPro('700') }]}>Food detail</Text>
        <Pressable
          onPress={() => toggleFavorite(food.id)}
          style={[styles.backBtn, { backgroundColor: isFav ? `${colors.danger}22` : c.chip }]}
          hitSlop={8}
        >
          <Heart
            size={18}
            color={isFav ? colors.danger : c.muted}
            fill={isFav ? colors.danger : 'transparent'}
          />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {food.imageUrl ? (
          <View style={[styles.productImageWrap, { borderColor: c.border, backgroundColor: c.chip }]}>
            <Image source={{ uri: food.imageUrl }} style={styles.productImage} resizeMode="contain" />
          </View>
        ) : null}
        <View style={styles.heroTop}>
          <AvatarInitial name={food.name} size={56} backgroundColor={colors.primary} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: c.text, fontFamily: FONT.nova }]}>{food.name}</Text>
            <Text style={[styles.brand, { color: c.muted, fontFamily: snPro('500') }]}>
              {food.brand} · {food.serving}
            </Text>
            {barcode || food.barcode ? (
              <Text style={[styles.barcodeLine, { color: c.muted, fontFamily: snPro('500') }]}>
                Barcode {barcode || food.barcode}
                {food.source === 'openfoodfacts' ? ' · Open Food Facts' : ''}
              </Text>
            ) : null}
          </View>
        </View>

        {food.tags?.length ? (
          <View style={styles.tagRow}>
            {food.tags.map((tag) => (
              <View
                key={tag}
                style={[styles.tag, { backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft, borderColor: c.border }]}
              >
                <Text style={[styles.tagText, { color: colors.primary, fontFamily: snPro('600') }]}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.heroCard, cardShadow, { borderColor: isDark ? c.border : 'rgba(0,112,224,0.14)' }]}>
          <LinearGradient
            colors={isDark ? ['#161616', '#121212'] : ['#FFFFFF', '#F0F7FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroInner}
          >
            <View style={styles.calBlock}>
              <Flame size={18} color={colors.primary} />
              <Text style={[styles.kcal, { color: c.text, fontFamily: snPro('800') }]}>{scaled.calories}</Text>
              <Text style={[styles.kcalLbl, { color: c.muted, fontFamily: snPro('600') }]}>calories</Text>
            </View>

            <MacroPieChart carbs={scaled.carbs} protein={scaled.protein} fat={scaled.fat} />
          </LinearGradient>
        </View>

        <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: c.text, fontFamily: snPro('700') }]}>Servings</Text>
            <View style={[styles.stepper, { backgroundColor: isDark ? '#1C1C1E' : c.chip, borderColor: c.border }]}>
              <Pressable onPress={() => adjust(-1)} style={styles.stepBtn} hitSlop={8}>
                <Minus size={16} color={servings <= 1 ? c.muted : c.text} />
              </Pressable>
              <Text style={[styles.stepVal, { color: c.text, fontFamily: snPro('800') }]}>{servings}</Text>
              <Pressable onPress={() => adjust(1)} style={styles.stepBtn} hitSlop={8}>
                <Plus size={16} color={servings >= 10 ? c.muted : c.text} />
              </Pressable>
            </View>
          </View>
          <Text style={[styles.servingHint, { color: c.muted }]}>
            Nutrition scales with servings · logs to {meal}
          </Text>
        </View>

        <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text, fontFamily: snPro('700') }]}>
            Vs daily goals
          </Text>
          <MacroBar
            label="Protein"
            current={scaled.protein}
            goal={profile.protein}
            color={colors.protein}
            textColor={c.text}
            muted={c.muted}
          />
          <View style={{ height: 12 }} />
          <MacroBar
            label="Carbs"
            current={scaled.carbs}
            goal={profile.carbs}
            color={colors.carbs}
            textColor={c.text}
            muted={c.muted}
          />
          <View style={{ height: 12 }} />
          <MacroBar
            label="Fat"
            current={scaled.fat}
            goal={profile.fat}
            color={colors.fat}
            textColor={c.text}
            muted={c.muted}
          />
        </View>

        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1A2744' : colors.primarySoft, borderColor: c.border }]}>
          <Utensils size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: c.muted, fontFamily: snPro('500') }]}>
            Values are per listed serving. Adjust servings above before logging.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.pageBg }]}>
        <View style={styles.footerMeta}>
          <Flame size={14} color={colors.primary} />
          <Text style={[styles.footerMetaText, { color: c.muted, fontFamily: snPro('600') }]}>
            {scaled.calories} kcal · {servings} serving{servings > 1 ? 's' : ''}
          </Text>
        </View>
        <AppButton label={`Log to ${meal}`} onPress={log} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: { fontSize: 15 },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  productImageWrap: {
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: '100%' },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  name: { fontSize: 26, lineHeight: 30 },
  brand: { fontSize: 13, marginTop: 4 },
  barcodeLine: { fontSize: 11, marginTop: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  tag: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { fontSize: 11, textTransform: 'capitalize' },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  heroInner: { padding: 16 },
  calBlock: { alignItems: 'center', marginBottom: 14 },
  kcal: { fontSize: 44, marginTop: 4 },
  kcalLbl: { fontSize: 12, marginTop: 2 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: { fontSize: 16, marginBottom: 12 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 4,
  },
  stepBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepVal: { minWidth: 28, textAlign: 'center', fontSize: 16 },
  servingHint: { fontSize: 12, marginTop: 10, textTransform: 'capitalize' },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 6,
  },
  footerMetaText: { fontSize: 12, textTransform: 'capitalize' },
});
