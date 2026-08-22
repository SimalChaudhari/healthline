import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Clock,
  Flame,
  Star,
  Minus,
  Plus,
  Utensils,
  ListOrdered,
  Leaf,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { themeColors, colors } from '../config/colors';
import { FONT, snPro } from '../config/fonts';
import { getRecipeById, mealFromRecipeTags } from '../data/recipes';
import MacroBar from '../components/MacroBar';

const TAG_COLORS = {
  Breakfast: colors.carbs,
  Lunch: colors.primary,
  Dinner: colors.protein,
  Snack: colors.aiPurple,
  Quick: colors.accent,
  'High protein': colors.exercise,
  'Low carb': colors.fat,
  'Plant-based': colors.accent,
};

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

function tagColor(tag) {
  return TAG_COLORS[tag] || colors.primary;
}

function recipeRating(id) {
  const n = id.charCodeAt(1) || 0;
  return (4.5 + (n % 5) * 0.1).toFixed(1);
}

function topInset(insets) {
  if (insets.top > 0) return insets.top;
  if (Platform.OS === 'android') return RNStatusBar.currentHeight || 28;
  return 44;
}

export default function RecipeDetailScreen({ navigation, route }) {
  const recipe = getRecipeById(route.params?.id);
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { addFood, profile } = useDiary();
  const insets = useSafeAreaInsets();
  const safeTop = topInset(insets);
  const [servings, setServings] = useState(1);

  const meal = useMemo(
    () => mealFromRecipeTags(recipe?.tags),
    [recipe?.tags],
  );

  const scaled = useMemo(() => {
    if (!recipe) return null;
    const n = recipe.nutrition || { carbs: 30, protein: 20, fat: 12 };
    return {
      calories: Math.round(recipe.calories * servings),
      carbs: Math.round(n.carbs * servings),
      protein: Math.round(n.protein * servings),
      fat: Math.round(n.fat * servings),
    };
  }, [recipe, servings]);

  if (!recipe || !scaled) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: c.pageBg }]}>
        <Text style={{ color: c.text, padding: 20 }}>Recipe not found.</Text>
      </SafeAreaView>
    );
  }

  const adjustServings = (delta) => {
    setServings((s) => Math.min(10, Math.max(1, s + delta)));
  };

  const log = () => {
    addFood(meal, {
      id: recipe.id,
      name: recipe.title,
      serving: servings === 1 ? '1 serving' : `${servings} servings`,
      calories: scaled.calories,
      carbs: scaled.carbs,
      protein: scaled.protein,
      fat: scaled.fat,
    });
    navigation.navigate('Main', { screen: 'Diary' });
  };

  return (
    <View style={[styles.root, { backgroundColor: c.pageBg }]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.heroStage}>
          <Image source={{ uri: recipe.image }} style={styles.hero} />
          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.72)']}
            locations={[0, 0.45, 1]}
            style={styles.heroGrad}
          />
          <View style={styles.heroPills}>
            <HeroPill icon={Clock} label={recipe.time} />
            <HeroPill icon={Flame} label={`${scaled.calories} kcal`} />
            <HeroPill icon={Star} label={recipeRating(recipe.id)} />
          </View>
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, { color: c.text, fontFamily: FONT.nova }]}>{recipe.title}</Text>

          <View style={styles.tagRow}>
            {recipe.tags.map((tag) => (
              <View
                key={tag}
                style={[styles.tag, { backgroundColor: `${tagColor(tag)}22`, borderColor: `${tagColor(tag)}44` }]}
              >
                <Text style={[styles.tagText, { color: tagColor(tag), fontFamily: snPro('600') }]}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.copy, { color: c.muted, fontFamily: snPro('400') }]}>
            {recipe.description}
          </Text>

          <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <View style={styles.cardHead}>
              <Text style={[styles.cardTitle, { color: c.text, fontFamily: snPro('700') }]}>Servings</Text>
              <View style={[styles.stepper, { backgroundColor: isDark ? '#1C1C1E' : c.chip, borderColor: c.border }]}>
                <Pressable onPress={() => adjustServings(-1)} style={styles.stepBtn} hitSlop={8}>
                  <Minus size={16} color={servings <= 1 ? c.muted : c.text} />
                </Pressable>
                <Text style={[styles.stepVal, { color: c.text, fontFamily: snPro('800') }]}>{servings}</Text>
                <Pressable onPress={() => adjustServings(1)} style={styles.stepBtn} hitSlop={8}>
                  <Plus size={16} color={servings >= 10 ? c.muted : c.text} />
                </Pressable>
              </View>
            </View>
            <Text style={[styles.servingHint, { color: c.muted }]}>
              Nutrition updates per serving · logs to {meal}
            </Text>
          </View>

          <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.text, fontFamily: snPro('700') }]}>Nutrition</Text>
            <View style={styles.nutriHero}>
              <Text style={[styles.kcalNum, { color: c.text, fontFamily: snPro('800') }]}>{scaled.calories}</Text>
              <Text style={[styles.kcalLbl, { color: c.muted, fontFamily: snPro('600') }]}>calories</Text>
            </View>
            <MacroBar label="Protein" current={scaled.protein} goal={profile.protein} color={colors.protein} textColor={c.text} muted={c.muted} />
            <View style={{ height: 10 }} />
            <MacroBar label="Carbs" current={scaled.carbs} goal={profile.carbs} color={colors.carbs} textColor={c.text} muted={c.muted} />
            <View style={{ height: 10 }} />
            <MacroBar label="Fat" current={scaled.fat} goal={profile.fat} color={colors.fat} textColor={c.text} muted={c.muted} />
          </View>

          <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <SectionHead icon={Leaf} label="Ingredients" theme={c} />
            {recipe.ingredients.map((item, i) => (
              <View key={item} style={[styles.listRow, i > 0 && { borderTopColor: c.border, borderTopWidth: 1 }]}>
                <View style={[styles.bullet, { backgroundColor: colors.primarySoft }]} />
                <Text style={[styles.listText, { color: c.text, fontFamily: snPro('500') }]}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.card, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <SectionHead icon={ListOrdered} label="Steps" theme={c} />
            {recipe.steps.map((step, i) => (
              <View key={step} style={[styles.stepRow, i > 0 && { borderTopColor: c.border, borderTopWidth: 1 }]}>
                <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.stepNumText, { fontFamily: snPro('700') }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: c.text, fontFamily: snPro('400') }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.topOverlay, { paddingTop: safeTop + 8 }]} pointerEvents="box-none">
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={[
            styles.back,
            { backgroundColor: isDark ? 'rgba(20,20,20,0.88)' : 'rgba(255,255,255,0.94)' },
          ]}
        >
          <ChevronLeft size={20} color={c.text} />
        </Pressable>
      </View>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: c.pageBg,
            borderTopColor: c.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.footerMeta}>
          <Utensils size={16} color={colors.primary} />
          <Text style={[styles.footerMetaText, { color: c.muted, fontFamily: snPro('600') }]}>
            {scaled.calories} kcal · {servings} serving{servings > 1 ? 's' : ''}
          </Text>
        </View>
        <Pressable
          onPress={log}
          style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={[styles.ctaText, { fontFamily: snPro('700') }]}>Log to {meal}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HeroPill({ icon: Icon, label }) {
  return (
    <View style={styles.heroPill}>
      <Icon size={12} color="#FFFFFF" />
      <Text style={[styles.heroPillText, { fontFamily: snPro('600') }]}>{label}</Text>
    </View>
  );
}

function SectionHead({ icon: Icon, label, theme }) {
  return (
    <View style={styles.sectionHead}>
      <Icon size={16} color={colors.primary} />
      <Text style={[styles.cardTitle, { color: theme.text, fontFamily: snPro('700'), marginBottom: 0, marginLeft: 8 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 24 },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 20,
  },
  heroStage: {
    height: 300,
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D1D5DB',
  },
  heroGrad: {
    ...StyleSheet.absoluteFillObject,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPills: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    marginRight: 6,
    marginTop: 4,
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginLeft: 4,
  },
  body: { padding: 20 },
  title: { fontSize: 26, lineHeight: 32 },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: { fontSize: 11 },
  copy: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 16,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
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
  stepVal: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 16,
  },
  servingHint: {
    fontSize: 12,
    marginTop: 10,
    textTransform: 'capitalize',
  },
  nutriHero: {
    alignItems: 'center',
    marginBottom: 14,
  },
  kcalNum: { fontSize: 36 },
  kcalLbl: { fontSize: 12, marginTop: 2 },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 99,
    marginTop: 6,
    marginRight: 10,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  footerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  footerMetaText: {
    fontSize: 12,
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  cta: {
    height: 52,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
