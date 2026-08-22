import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';
import { colors } from '../config/colors';

export default function MealSection({
  title,
  items,
  theme,
  isDark,
  icon: Icon,
  accent,
  onAdd,
  onRemove,
}) {
  const mealCals = items.reduce((s, i) => s + i.calories, 0);

  return (
    <View style={[styles.card, cardShadow, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.mealIcon, { backgroundColor: isDark ? '#1C1C1E' : `${accent}18` }]}>
            <Icon size={16} color={accent} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.sub, { color: theme.muted }]}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.cals, { color: accent }]}>{mealCals}</Text>
          <Text style={[styles.calsLbl, { color: theme.muted }]}>kcal</Text>
          <Pressable onPress={onAdd} style={[styles.addBtn, { backgroundColor: accent }]} hitSlop={8}>
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      {items.length === 0 ? (
        <Pressable
          onPress={onAdd}
          style={[styles.empty, { borderColor: theme.border, backgroundColor: isDark ? '#1C1C1E' : theme.chip }]}
        >
          <Plus size={16} color={accent} />
          <Text style={[styles.emptyText, { color: theme.muted }]}>Add food</Text>
        </Pressable>
      ) : (
        items.map((item) => (
          <View key={item.logId} style={[styles.row, { borderTopColor: theme.border }]}>
            <View style={styles.rowText}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.meta, { color: theme.muted }]}>
                {item.serving} · P {item.protein}g · C {item.carbs}g · F {item.fat}g
              </Text>
            </View>
            <View style={[styles.calPill, { backgroundColor: isDark ? '#1C1C1E' : `${accent}14` }]}>
              <Text style={[styles.itemCal, { color: accent }]}>{item.calories}</Text>
            </View>
            {onRemove ? (
              <Pressable onPress={() => onRemove(item.logId)} hitSlop={8} style={styles.trash}>
                <Trash2 size={15} color={theme.muted} />
              </Pressable>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  android: { elevation: 1 },
  default: {},
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mealIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 11, marginTop: 1, fontWeight: '500' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cals: { fontSize: 16, fontWeight: '800' },
  calsLbl: { fontSize: 11, fontWeight: '600', marginRight: 4 },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  emptyText: { fontSize: 13, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 10,
    borderTopWidth: 1,
  },
  rowText: { flex: 1, minWidth: 0, paddingRight: 8 },
  name: { fontSize: 14, fontWeight: '600' },
  meta: { fontSize: 11, marginTop: 3, lineHeight: 15 },
  calPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    minWidth: 44,
    alignItems: 'center',
  },
  itemCal: { fontSize: 13, fontWeight: '800' },
  trash: { marginLeft: 8 },
});
