import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

/** Horizontal macro progress — measured width on native; % fallback for web. */
export default function MacroBar({ label, current, goal, color, textColor, muted }) {
  const [trackW, setTrackW] = useState(0);
  const pct = goal > 0 ? Math.min(1, Math.max(0, current / goal)) : 0;
  const fillStyle =
    trackW > 0
      ? { width: Math.max(0, trackW * pct), backgroundColor: color }
      : { width: `${pct * 100}%`, backgroundColor: color };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        <Text style={[styles.value, { color: muted }]}>
          {Math.round(current)} / {goal}g
        </Text>
      </View>
      <View
        style={[styles.track, { backgroundColor: `${color}22` }]}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && Math.abs(w - trackW) > 0.5) setTrackW(w);
        }}
      >
        {pct > 0 ? <View style={[styles.fill, fillStyle]} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', minWidth: 0 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { fontSize: 12, fontWeight: '700' },
  value: { fontSize: 11, fontWeight: '500' },
  track: {
    alignSelf: 'stretch',
    height: 7,
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    height: 7,
    borderRadius: 99,
  },
});
