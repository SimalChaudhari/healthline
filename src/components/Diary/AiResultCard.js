import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import MacroPieChart from '../common/MacroPieChart';

export default function AiResultCard({ result }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);

  const totals = useMemo(() => {
    const items = result?.items || [];
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fat: acc.fat + (item.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [result]);

  if (!result?.items?.length) return null;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: c.cardBg,
          borderColor: c.border,
        },
      ]}
    >
      <View
        style={[
          styles.hero,
          {
            backgroundColor: isDark ? 'rgba(0,112,224,0.16)' : colors.primarySoft,
            borderColor: isDark ? 'rgba(0,112,224,0.35)' : 'rgba(0,112,224,0.2)',
          },
        ]}
      >
        <View style={styles.heroTop}>
          <View style={styles.badge}>
            <Sparkles size={12} color="#FFFFFF" />
            <Text style={[styles.badgeText, { fontFamily: snPro('700') }]}>AI estimate</Text>
          </View>
          {result.mode ? (
            <Text style={[styles.mode, { color: c.muted, fontFamily: snPro('600') }]}>
              {result.mode === 'vision' ? 'From photo' : 'From description'}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.summary, { color: c.text, fontFamily: FONT.nova }]} numberOfLines={2}>
          {result.summary || 'Meal estimate'}
        </Text>
        <View style={styles.calRow}>
          <Flame size={18} color={colors.primary} style={styles.calIcon} />
          <Text style={[styles.calNum, { color: c.text, fontFamily: snPro('800') }]}>
            {totals.calories}
          </Text>
          <Text style={[styles.calUnit, { color: c.muted, fontFamily: snPro('600') }]}>kcal total</Text>
        </View>
      </View>

      <View style={styles.pieWrap}>
        <MacroPieChart carbs={totals.carbs} protein={totals.protein} fat={totals.fat} />
      </View>

      <Text style={[styles.listTitle, { color: c.muted, fontFamily: snPro('800') }]}>
        DETECTED FOODS · {result.items.length}
      </Text>

      {result.items.map((item, index) => (
        <View
          key={item.id}
          style={[
            styles.itemCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : c.chip,
              borderColor: c.border,
            },
          ]}
        >
          <View
            style={[
              styles.itemIndex,
              { backgroundColor: isDark ? 'rgba(0,112,224,0.35)' : colors.primarySoft },
            ]}
          >
            <Text style={[styles.itemIndexText, { color: colors.primary, fontFamily: snPro('700') }]}>
              {index + 1}
            </Text>
          </View>
          <View style={styles.itemBody}>
            <Text style={[styles.itemName, { color: c.text, fontFamily: snPro('700') }]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[styles.itemServing, { color: c.muted, fontFamily: snPro('500') }]}>{item.serving}</Text>
            <View style={styles.itemMacros}>
              <Text style={[styles.pill, { color: colors.protein }]}>P {item.protein}g</Text>
              <Text style={[styles.pill, { color: colors.carbs }]}>C {item.carbs}g</Text>
              <Text style={[styles.pill, { color: colors.fat }]}>F {item.fat}g</Text>
            </View>
          </View>
          <View style={styles.itemCalBox}>
            <Text style={[styles.itemCal, { fontFamily: snPro('800') }]}>{item.calories}</Text>
            <Text style={[styles.itemCalLbl, { color: c.muted }]}>kcal</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  hero: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.aiPurple,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    gap: 5,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11 },
  mode: { fontSize: 11 },
  summary: { fontSize: 22, lineHeight: 28 },
  calRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  calIcon: {
    marginTop: 1,
  },
  calNum: {
    fontSize: 34,
    lineHeight: 38,
    includeFontPadding: false,
  },
  calUnit: {
    fontSize: 13,
    lineHeight: 18,
    includeFontPadding: false,
  },
  pieWrap: {
    marginTop: 12,
    paddingVertical: 4,
  },
  listTitle: {
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  itemIndex: {
    width: 28,
    height: 28,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemIndexText: { fontSize: 12 },
  itemBody: { flex: 1, minWidth: 0, paddingRight: 8 },
  itemName: { fontSize: 15 },
  itemServing: { fontSize: 12, marginTop: 2 },
  itemMacros: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 8 },
  pill: { fontSize: 11, fontWeight: '700' },
  itemCalBox: { alignItems: 'flex-end' },
  itemCal: { color: colors.primary, fontSize: 18 },
  itemCalLbl: { fontSize: 10, marginTop: 1 },
});
