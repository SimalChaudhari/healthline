import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Clock,
  Flame,
  ChevronRight,
  Sparkles,
  Star,
  X,
} from 'lucide-react-native';
import ScreenShell from '../components/ScreenShell';
import { useTheme } from '../context/ThemeContext';
import { themeColors, colors } from '../config/colors';
import { FONT, snPro } from '../config/fonts';
import { RECIPES, RECIPE_FILTERS } from '../data/recipes';

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

export default function DiscoverScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const featured = RECIPES[0];

  const quickPicks = useMemo(
    () => RECIPES.filter((r) => r.tags.includes('Quick') || parseInt(r.time, 10) <= 10),
    [],
  );

  const list = useMemo(() => {
    let items = filter === 'All' ? RECIPES : RECIPES.filter((r) => r.tags.includes(filter));
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return items;
  }, [filter, query]);

  const openRecipe = (id) => navigation.navigate('RecipeDetail', { id });

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: colors.primary, fontFamily: snPro('800') }]}>RECIPES</Text>
        <Text style={[styles.title, { color: c.text }]}>Never run out of ideas</Text>
        <Text style={[styles.sub, { color: c.muted }]}>
          Healthy meals inspired by top nutrition apps. Tap a card for details or log to your diary.
        </Text>

        <View style={[styles.searchWrap, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <Search size={18} color={c.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search recipes or tags…"
            placeholderTextColor={c.muted}
            style={[styles.searchInput, { color: c.text, fontFamily: snPro('400') }]}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color={c.muted} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={() => openRecipe(featured.id)}
          style={[styles.featured, cardShadow, { borderColor: isDark ? c.border : 'rgba(0,112,224,0.14)' }]}
        >
          <Image source={{ uri: featured.image }} style={styles.featuredImg} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.82)']}
            style={styles.featuredGrad}
          >
            <View style={styles.featuredBadge}>
              <Sparkles size={12} color="#FFFFFF" />
              <Text style={[styles.featuredBadgeText, { fontFamily: snPro('700') }]}>Chef's pick</Text>
            </View>
            <Text style={[styles.featuredTitle, { fontFamily: FONT.nova }]}>{featured.title}</Text>
            <View style={styles.featuredMeta}>
              <MetaPill icon={Clock} label={featured.time} />
              <MetaPill icon={Flame} label={`${featured.calories} kcal`} />
              <MetaPill icon={Star} label={recipeRating(featured.id)} />
            </View>
          </LinearGradient>
        </Pressable>

        <Text style={[styles.section, { color: c.text, fontFamily: snPro('800') }]}>QUICK BITES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickScroll}
        >
          {quickPicks.map((recipe) => (
            <Pressable
              key={recipe.id}
              onPress={() => openRecipe(recipe.id)}
              style={[styles.quickCard, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}
            >
              <Image source={{ uri: recipe.image }} style={styles.quickImg} />
              <View style={styles.quickBody}>
                <Text numberOfLines={2} style={[styles.quickTitle, { color: c.text, fontFamily: snPro('700') }]}>
                  {recipe.title}
                </Text>
                <Text style={[styles.quickSub, { color: c.muted, fontFamily: snPro('500') }]}>
                  {recipe.time} · {recipe.calories} kcal
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {RECIPE_FILTERS.map((f) => {
            const on = filter === f;
            const count =
              f === 'All'
                ? RECIPES.length
                : RECIPES.filter((r) => r.tags.includes(f)).length;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: on ? colors.primary : isDark ? '#1C1C1E' : c.chip,
                    borderColor: on ? colors.primary : c.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: on ? '#FFFFFF' : c.text, fontFamily: snPro('700') }]}>
                  {f}
                </Text>
                <View
                  style={[
                    styles.chipCount,
                    { backgroundColor: on ? 'rgba(255,255,255,0.22)' : isDark ? '#2A2A2A' : '#E5E7EB' },
                  ]}
                >
                  <Text style={[styles.chipCountText, { color: on ? '#FFFFFF' : c.muted, fontFamily: snPro('700') }]}>
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.listHead}>
          <Text style={[styles.section, { color: c.text, fontFamily: snPro('800'), marginBottom: 0 }]}>
            ALL RECIPES
          </Text>
          <Text style={[styles.listCount, { color: c.muted, fontFamily: snPro('600') }]}>
            {list.length} {list.length === 1 ? 'result' : 'results'}
          </Text>
        </View>

        {list.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <Search size={28} color={c.muted} />
            <Text style={[styles.emptyTitle, { color: c.text, fontFamily: snPro('700') }]}>No recipes found</Text>
            <Text style={[styles.emptySub, { color: c.muted }]}>
              Try another filter or clear your search.
            </Text>
            <Pressable
              onPress={() => {
                setQuery('');
                setFilter('All');
              }}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.emptyBtnText, { fontFamily: snPro('700') }]}>Reset filters</Text>
            </Pressable>
          </View>
        ) : (
          list.map((recipe) => (
            <Pressable
              key={recipe.id}
              onPress={() => openRecipe(recipe.id)}
              style={({ pressed }) => [
                styles.card,
                cardShadow,
                {
                  backgroundColor: c.cardBg,
                  borderColor: c.border,
                  opacity: pressed ? 0.92 : 1,
                },
              ]}
            >
              <View style={styles.imageWrap}>
                <Image source={{ uri: recipe.image }} style={styles.image} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.55)']}
                  style={styles.imageGrad}
                />
                <View style={styles.imagePills}>
                  <View style={styles.imagePill}>
                    <Clock size={11} color="#FFFFFF" />
                    <Text style={[styles.imagePillText, { fontFamily: snPro('600') }]}>{recipe.time}</Text>
                  </View>
                  <View style={styles.imagePill}>
                    <Flame size={11} color="#FFFFFF" />
                    <Text style={[styles.imagePillText, { fontFamily: snPro('600') }]}>{recipe.calories}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.meta}>
                <View style={styles.metaTop}>
                  <Text style={[styles.cardTitle, { color: c.text, fontFamily: snPro('700') }]} numberOfLines={2}>
                    {recipe.title}
                  </Text>
                  <View style={[styles.ratingBadge, { backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft }]}>
                    <Star size={12} color={colors.carbs} fill={colors.carbs} />
                    <Text style={[styles.ratingText, { color: c.text, fontFamily: snPro('700') }]}>
                      {recipeRating(recipe.id)}
                    </Text>
                  </View>
                </View>
                <View style={styles.tagRow}>
                  {recipe.tags.map((tag) => (
                    <View
                      key={`${recipe.id}-${tag}`}
                      style={[styles.tag, { backgroundColor: `${tagColor(tag)}22`, borderColor: `${tagColor(tag)}44` }]}
                    >
                      <Text style={[styles.tagText, { color: tagColor(tag), fontFamily: snPro('600') }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.cardFoot}>
                  <Text style={[styles.cardSub, { color: c.muted, fontFamily: snPro('500') }]}>
                    Tap to view · log to diary
                  </Text>
                  <ChevronRight size={16} color={colors.primary} />
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ScreenShell>
  );
}

function MetaPill({ icon: Icon, label }) {
  return (
    <View style={styles.metaPill}>
      <Icon size={12} color="#FFFFFF" />
      <Text style={[styles.metaPillText, { fontFamily: snPro('600') }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 36 },
  kicker: { fontSize: 11, letterSpacing: 1 },
  title: { fontSize: 26, marginTop: 4, fontFamily: FONT.nova },
  sub: { fontSize: 14, marginTop: 6, marginBottom: 14, lineHeight: 20 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    paddingVertical: 0,
  },
  featured: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18,
    height: 200,
  },
  featuredImg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#D1D5DB',
  },
  featuredGrad: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginLeft: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    marginRight: 6,
    marginTop: 4,
  },
  metaPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginLeft: 4,
  },
  section: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 10,
  },
  quickScroll: {
    paddingBottom: 16,
  },
  quickCard: {
    width: 140,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 10,
  },
  quickImg: {
    width: '100%',
    height: 96,
    backgroundColor: '#D1D5DB',
  },
  quickBody: {
    padding: 10,
  },
  quickTitle: {
    fontSize: 13,
    lineHeight: 17,
    minHeight: 34,
  },
  quickSub: {
    fontSize: 11,
    marginTop: 4,
  },
  chips: {
    paddingBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 99,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipText: { fontSize: 13 },
  chipCount: {
    minWidth: 22,
    height: 22,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  chipCountText: { fontSize: 11 },
  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listCount: { fontSize: 12 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  imageWrap: {
    height: 168,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D1D5DB',
  },
  imageGrad: {
    ...StyleSheet.absoluteFillObject,
  },
  imagePills: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
  },
  imagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    marginRight: 6,
  },
  imagePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    marginLeft: 4,
  },
  meta: { padding: 14 },
  metaTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
    lineHeight: 21,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
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
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardSub: { fontSize: 12 },
  empty: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyBtn: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 99,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
