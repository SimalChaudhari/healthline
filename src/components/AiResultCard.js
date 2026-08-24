import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wheat, Beef, Droplet, Flame, Sparkles } from 'lucide-react-native';
import { colors } from '../config/colors';
import { FONT, snPro } from '../config/fonts';

export default function AiResultCard({ result }) {
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
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.badge}>
            <Sparkles size={12} color="#FFFFFF" />
            <Text style={[styles.badgeText, { fontFamily: snPro('700') }]}>AI estimate</Text>
          </View>
          {result.mode ? (
            <Text style={[styles.mode, { fontFamily: snPro('600') }]}>
              {result.mode === 'vision' ? 'From photo' : 'From description'}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.summary, { fontFamily: FONT.nova }]} numberOfLines={2}>
          {result.summary || 'Meal estimate'}
        </Text>
        <View style={styles.calRow}>
          <Flame size={18} color={colors.primary} />
          <Text style={[styles.calNum, { fontFamily: snPro('800') }]}>{totals.calories}</Text>
          <Text style={[styles.calUnit, { fontFamily: snPro('600') }]}>kcal total</Text>
        </View>
      </View>

      <View style={styles.macroRow}>
        <MacroChip icon={Wheat} label="Carbs" value={`${totals.carbs}g`} color={colors.carbs} />
        <MacroChip icon={Beef} label="Protein" value={`${totals.protein}g`} color={colors.protein} />
        <MacroChip icon={Droplet} label="Fat" value={`${totals.fat}g`} color={colors.fat} />
      </View>

      <Text style={[styles.listTitle, { fontFamily: snPro('800') }]}>
        DETECTED FOODS · {result.items.length}
      </Text>

      {result.items.map((item, index) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemIndex}>
            <Text style={[styles.itemIndexText, { fontFamily: snPro('700') }]}>{index + 1}</Text>
          </View>
          <View style={styles.itemBody}>
            <Text style={[styles.itemName, { fontFamily: snPro('700') }]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[styles.itemServing, { fontFamily: snPro('500') }]}>{item.serving}</Text>
            <View style={styles.itemMacros}>
              <Text style={[styles.pill, { color: colors.protein }]}>P {item.protein}g</Text>
              <Text style={[styles.pill, { color: colors.carbs }]}>C {item.carbs}g</Text>
              <Text style={[styles.pill, { color: colors.fat }]}>F {item.fat}g</Text>
            </View>
          </View>
          <View style={styles.itemCalBox}>
            <Text style={[styles.itemCal, { fontFamily: snPro('800') }]}>{item.calories}</Text>
            <Text style={styles.itemCalLbl}>kcal</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function MacroChip({ icon: Icon, label, value, color }) {
  return (
    <View style={[styles.macroChip, { borderColor: `${color}55`, backgroundColor: `${color}18` }]}>
      <Icon size={14} color={color} />
      <Text style={[styles.macroVal, { color, fontFamily: snPro('800') }]}>{value}</Text>
      <Text style={[styles.macroLbl, { fontFamily: snPro('600') }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 14 },
  hero: {
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(0,112,224,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(0,112,224,0.35)',
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
  mode: { color: 'rgba(255,255,255,0.55)', fontSize: 11 },
  summary: { color: '#FFFFFF', fontSize: 22, lineHeight: 28 },
  calRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 12,
    gap: 6,
  },
  calNum: { color: '#FFFFFF', fontSize: 34, lineHeight: 36 },
  calUnit: { color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 4 },
  macroRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  macroChip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  macroVal: { fontSize: 14, marginTop: 4 },
  macroLbl: { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 2 },
  listTitle: {
    color: 'rgba(255,255,255,0.5)',
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
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    padding: 12,
    marginBottom: 8,
  },
  itemIndex: {
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: 'rgba(0,112,224,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemIndexText: { color: '#FFFFFF', fontSize: 12 },
  itemBody: { flex: 1, minWidth: 0, paddingRight: 8 },
  itemName: { color: '#FFFFFF', fontSize: 15 },
  itemServing: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 },
  itemMacros: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 8 },
  pill: { fontSize: 11, fontWeight: '700' },
  itemCalBox: { alignItems: 'flex-end' },
  itemCal: { color: colors.primary, fontSize: 18 },
  itemCalLbl: { color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 1 },
});
