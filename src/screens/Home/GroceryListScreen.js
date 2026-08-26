import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { Check, Plus, Trash2 } from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { useConfirm } from '../../context/ConfirmContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';

const AISLES = ['Produce', 'Protein', 'Pantry', 'Dairy & extras', 'Other'];

export default function GroceryListScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { confirm } = useConfirm();
  const { grocery, toggleGroceryItem, addGroceryItem, removeGroceryItem, updateGroceryItem } = useDiary();

  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [aisle, setAisle] = useState('Other');

  const sections = useMemo(() => {
    const map = {};
    grocery.forEach((item) => {
      const key = item.aisle || 'Other';
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    const order = [...AISLES, ...Object.keys(map).filter((k) => !AISLES.includes(k))];
    return order.filter((k) => map[k]?.length).map((aisleKey) => ({ aisle: aisleKey, items: map[aisleKey] }));
  }, [grocery]);

  const total = grocery.length;
  const doneCount = grocery.filter((g) => g.checked).length;
  const left = total - doneCount;
  const pct = total ? (doneCount / total) * 100 : 0;

  const submitAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addGroceryItem({ name: trimmed, qty: qty.trim() || '1', aisle });
    setName('');
    setQty('1');
    setAisle('Other');
    setAdding(false);
  };

  const onRemove = async (item) => {
    const ok = await confirm({
      title: 'Remove item?',
      message: `Remove “${item.name}” from your list.`,
      confirmLabel: 'Remove',
    });
    if (ok) removeGroceryItem(item.id);
  };

  return (
    <ScreenShell>
      <ScreenHeader title="Grocery list" onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.headline, { color: c.text, fontFamily: FONT.nova }]}>Grocery list</Text>
        <Text style={[styles.sub, { color: c.muted }]}>
          {left} of {total} left · tap to check off
        </Text>

        <View style={[styles.track, { backgroundColor: c.chip }]}>
          <View style={[styles.trackFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
        </View>

        {adding ? (
          <View style={[styles.addCard, { backgroundColor: c.cardBg, borderColor: c.border }]}>
            <Text style={[styles.addTitle, { color: c.text, fontFamily: snPro('700') }]}>Add item</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Item name"
              placeholderTextColor={c.muted}
              style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: isDark ? '#1C1C1E' : '#F4F6F8' }]}
            />
            <TextInput
              value={qty}
              onChangeText={setQty}
              placeholder="Qty"
              placeholderTextColor={c.muted}
              style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: isDark ? '#1C1C1E' : '#F4F6F8' }]}
            />
            <View style={styles.aisleRow}>
              {AISLES.map((a) => {
                const on = aisle === a;
                return (
                  <Pressable
                    key={a}
                    onPress={() => setAisle(a)}
                    style={[
                      styles.aisleChip,
                      {
                        borderColor: on ? colors.primary : c.border,
                        backgroundColor: on ? (isDark ? 'rgba(0,112,224,0.18)' : colors.primarySoft) : 'transparent',
                      },
                    ]}
                  >
                    <Text style={{ color: on ? colors.primary : c.muted, fontSize: 11, fontFamily: snPro('600') }}>
                      {a}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.addActions}>
              <Pressable onPress={() => setAdding(false)} style={styles.cancelBtn}>
                <Text style={{ color: c.muted, fontFamily: snPro('600') }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={submitAdd}
                style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: name.trim() ? 1 : 0.5 }]}
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
            <Text style={{ color: colors.primary, fontFamily: snPro('700') }}>Add grocery item</Text>
          </Pressable>
        )}

        {sections.map((section) => (
          <View key={section.aisle} style={styles.section}>
            <Text style={[styles.aisle, { color: c.muted, fontFamily: snPro('800') }]}>
              {section.aisle.toUpperCase()}
            </Text>
            <View style={[styles.aisleCard, { backgroundColor: c.cardBg, borderColor: c.border }]}>
              {section.items.map((item, idx) => {
                const done = !!item.checked;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.row,
                      idx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border },
                    ]}
                  >
                    <Pressable onPress={() => toggleGroceryItem(item.id)} style={styles.rowMain}>
                      <View
                        style={[
                          styles.check,
                          {
                            backgroundColor: done ? colors.primary : 'transparent',
                            borderColor: done ? colors.primary : c.border,
                          },
                        ]}
                      >
                        {done ? <Check size={14} color="#FFFFFF" /> : null}
                      </View>
                      <Text
                        style={[
                          styles.itemName,
                          {
                            flex: 1,
                            color: done ? c.muted : c.text,
                            fontFamily: snPro('600'),
                            textDecorationLine: done ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </Pressable>
                    <TextInput
                      value={String(item.qty ?? '')}
                      onChangeText={(t) => updateGroceryItem(item.id, { qty: t })}
                      placeholder="Qty"
                      placeholderTextColor={c.muted}
                      style={[styles.qtyInput, { color: c.muted }]}
                    />
                    <Pressable onPress={() => onRemove(item)} hitSlop={8} style={styles.trash}>
                      <Trash2 size={15} color={c.muted} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  headline: { fontSize: 26 },
  sub: { fontSize: 13, marginTop: 4, marginBottom: 12, lineHeight: 18 },
  track: { height: 5, borderRadius: 99, overflow: 'hidden', marginBottom: 16 },
  trackFill: { height: '100%', borderRadius: 99 },
  addTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  addCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16, gap: 10 },
  addTitle: { fontSize: 15, marginBottom: 2 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  aisleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  aisleChip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  addActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  saveBtn: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18 },
  section: { marginBottom: 16 },
  aisle: { fontSize: 10, letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 },
  aisleCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingRight: 8 },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingRight: 4 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: { fontSize: 14 },
  qtyInput: { fontSize: 12, paddingVertical: 8, paddingHorizontal: 6, minWidth: 48, maxWidth: 72 },
  trash: { padding: 8 },
});
