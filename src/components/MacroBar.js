import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MacroBar({ label, current, goal, color, textColor, muted }) {
  const pct = goal > 0 ? Math.min(1, current / goal) : 0;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        <Text style={[styles.value, { color: muted }]}>
          {Math.round(current)} / {goal}g
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: `${color}22` }]}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minWidth: 0 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { fontSize: 12, fontWeight: '700' },
  value: { fontSize: 11, fontWeight: '500' },
  track: {
    height: 7,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: 7,
    borderRadius: 99,
  },
});
