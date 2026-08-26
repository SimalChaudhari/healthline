import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { Flame, ShoppingBag, Plus, Trash2 } from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import AppButton from '../../components/common/AppButton';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { useConfirm } from '../../context/ConfirmContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import { DAY_KEYS, DAY_LABELS, getTodayDayKey } from '../../data/mealPlan';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function MealPlanScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { confirm } = useConfirm();
  const { mealPlan, addMealPlanItem, removeMealPlanItem } = useDiary();
  const [day, setDay] = useState(getTodayDayKey());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    mealType: 'Lunch',
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const meals = mealPlan[day] || [];
  const totals = useMemo(
    () =>
      meals.reduce(
        (acc, m) => ({
          calories: acc.calories + (m.calories || 0),
          protein: acc.protein + (m.protein || 0),
          carbs: acc.carbs + (m.carbs || 0),
          fat: acc.fat + (m.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [meals],
  );

  const submitAdd = () => {
    const trimmed = form.name.trim();
    if (!trimmed) return;
    addMealPlanItem(day, {
      mealType: form.mealType,
      name: trimmed,
      calories: form.calories,
      protein: form.protein,
      carbs: form.carbs,
      fat: form.fat,
    });
    setForm({ mealType: 'Lunch', name: '', calories: '', protein: '', carbs: '', fat: '' });
    setAdding(false);
  };

  const onRemove = async (item) => {
    const ok = await confirm({
      title: 'Remove meal?',
      message: `Remove “${item.name}” from ${DAY_LABELS[day]}.`,
      confirmLabel: 'Remove',
    });
    if (ok) removeMealPlanItem(day, item.id);
  };

  return (
    <ScreenShell>
      <ScreenHeader title="Meal plan" onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.headline, { color: c.text, fontFamily: FONT.nova }]}>This week</Text>
        <Text style={[styles.sub, { color: c.muted }]}>Edit slots or add meals · grocery list stays in sync later</Text>

        <View style={styles.dayRow}>
          {DAY_KEYS.map((d) => {
            const on = d === day;
            return (
              <Pressable
                key={d}
                onPress={() => setDay(d)}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: on ? colors.primary : isDark ? c.chip : c.cardBg,
                    borderColor: on ? colors.primary : c.border,
                  },
                ]}
              >
                <Text style={[styles.dayDow, { color: on ? '#FFFFFF' : c.muted, fontFamily: snPro('600') }]}>{d}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.dayTitle, { color: c.text, fontFamily: snPro('700') }]}>{DAY_LABELS[day]}</Text>

        <View
          style={[
            styles.totalCard,
            { backgroundColor: isDark ? 'rgba(0,112,224,0.16)' : colors.primarySoft, borderColor: c.border },
          ]}
        >
          <Flame size={18} color={colors.primary} />
          <Text style={[styles.totalCal, { color: c.text, fontFamily: snPro('800') }]}>{totals.calories} kcal</Text>
          <Text style={[styles.totalMeta, { color: c.muted }]}>
            P {totals.protein}g · C {totals.carbs}g · F {totals.fat}g
          </Text>
        </View>

        {meals.map((m) => (
          <View key={m.id} style={[styles.mealCard, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.mealType, { color: colors.primary, fontFamily: snPro('800') }]}>
                {(m.mealType || '').toUpperCase()}
              </Text>
              <Text style={[styles.mealName, { color: c.text, fontFamily: snPro('700') }]}>{m.name}</Text>
              <Text style={[styles.mealMeta, { color: c.muted }]}>
                {m.calories} kcal · P{m.protein} C{m.carbs} F{m.fat}
              </Text>
            </View>
            <Pressable onPress={() => onRemove(m)} hitSlop={8} style={styles.trash}>
              <Trash2 size={16} color={c.muted} />
            </Pressable>
          </View>
        ))}

        {adding ? (
          <View style={[styles.addCard, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <Text style={[styles.addTitle, { color: c.text, fontFamily: snPro('700') }]}>Add meal</Text>
            <View style={styles.typeRow}>
              {MEAL_TYPES.map((t) => {
                const on = form.mealType === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setForm((f) => ({ ...f, mealType: t }))}
                    style={[
                      styles.typeChip,
                      {
                        borderColor: on ? colors.primary : c.border,
                        backgroundColor: on ? (isDark ? 'rgba(0,112,224,0.18)' : colors.primarySoft) : 'transparent',
                      },
                    ]}
                  >
                    <Text style={{ color: on ? colors.primary : c.muted, fontSize: 11, fontFamily: snPro('600') }}>
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              value={form.name}
              onChangeText={(name) => setForm((f) => ({ ...f, name }))}
              placeholder="Meal name"
              placeholderTextColor={c.muted}
              style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: isDark ? '#1C1C1E' : '#F4F6F8' }]}
            />
            <View style={styles.macroRow}>
              {[
                { key: 'calories', ph: 'kcal' },
                { key: 'protein', ph: 'P g' },
                { key: 'carbs', ph: 'C g' },
                { key: 'fat', ph: 'F g' },
              ].map((f) => (
                <TextInput
                  key={f.key}
                  value={form[f.key]}
                  onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                  placeholder={f.ph}
                  placeholderTextColor={c.muted}
                  keyboardType="number-pad"
                  style={[
                    styles.macroInput,
                    { color: c.text, borderColor: c.border, backgroundColor: isDark ? '#1C1C1E' : '#F4F6F8' },
                  ]}
                />
              ))}
            </View>
            <View style={styles.addActions}>
              <Pressable onPress={() => setAdding(false)} style={styles.cancelBtn}>
                <Text style={{ color: c.muted, fontFamily: snPro('600') }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={submitAdd}
                style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: form.name.trim() ? 1 : 0.5 }]}
              >
                <Text style={{ color: '#FFF', fontFamily: snPro('700') }}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => setAdding(true)}
            style={[styles.addTrigger, { borderColor: c.border, backgroundColor: c.cardBg }]}
          >
            <Plus size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontFamily: snPro('700') }}>Add meal</Text>
          </Pressable>
        )}

        <AppButton
          label="Grocery list"
          icon={ShoppingBag}
          onPress={() => navigation.navigate('GroceryList')}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  headline: { fontSize: 26 },
  sub: { fontSize: 13, marginTop: 4, marginBottom: 16 },
  dayRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  dayChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  dayDow: { fontSize: 11 },
  dayTitle: { fontSize: 16, marginBottom: 12 },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  totalCal: { fontSize: 18 },
  totalMeta: { fontSize: 12, flex: 1, textAlign: 'right' },
  mealCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealType: { fontSize: 10, letterSpacing: 0.8, marginBottom: 4 },
  mealName: { fontSize: 15 },
  mealMeta: { fontSize: 12, marginTop: 4 },
  trash: { padding: 6 },
  addTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    marginTop: 4,
  },
  addCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12, gap: 10 },
  addTitle: { fontSize: 15 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeChip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 13,
    textAlign: 'center',
  },
  addActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  saveBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18 },
});
