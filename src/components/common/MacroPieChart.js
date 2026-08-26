import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, themeColors } from '../../config/colors';
import { snPro } from '../../config/fonts';
import { useTheme } from '../../context/ThemeContext';

const SIZE = 140;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_OUT = 58;
const R_IN = 34;
/** Tiny gap between slices (degrees) so segments read clearly on APK */
const GAP = 2.5;

function toRad(deg) {
  return ((deg - 90) * Math.PI) / 180;
}

function pt(cx, cy, r, deg) {
  const a = toRad(deg);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** Clockwise donut wedge from startDeg → endDeg (0° = top). */
function donutPath(cx, cy, rOut, rIn, startDeg, endDeg) {
  const sweep = endDeg - startDeg;
  if (sweep <= 0.05) return null;

  // Full ring edge-case
  if (sweep >= 359.9) {
    return [
      `M ${cx} ${cy - rOut}`,
      `A ${rOut} ${rOut} 0 1 1 ${cx - 0.01} ${cy - rOut}`,
      `L ${cx - 0.01} ${cy - rIn}`,
      `A ${rIn} ${rIn} 0 1 0 ${cx} ${cy - rIn}`,
      'Z',
    ].join(' ');
  }

  const large = sweep > 180 ? 1 : 0;
  const o0 = pt(cx, cy, rOut, startDeg);
  const o1 = pt(cx, cy, rOut, endDeg);
  const i1 = pt(cx, cy, rIn, endDeg);
  const i0 = pt(cx, cy, rIn, startDeg);

  return [
    `M ${o0.x} ${o0.y}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${o1.x} ${o1.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${i0.x} ${i0.y}`,
    'Z',
  ].join(' ');
}

/**
 * Macro donut (path-based — reliable on Expo Android/APK + web).
 * Percents = calorie share (4 / 4 / 9 kcal per gram).
 */
export default function MacroPieChart({ carbs = 0, protein = 0, fat = 0, size = SIZE }) {
  const { isDark } = useTheme();
  const theme = themeColors(isDark);

  const { slices } = useMemo(() => {
    const values = [
      {
        key: 'carbs',
        label: 'Carbs',
        grams: Math.round(Number(carbs) || 0),
        kcal: Math.max(0, Number(carbs) || 0) * 4,
        color: colors.carbs,
      },
      {
        key: 'protein',
        label: 'Protein',
        grams: Math.round(Number(protein) || 0),
        kcal: Math.max(0, Number(protein) || 0) * 4,
        color: colors.protein,
      },
      {
        key: 'fat',
        label: 'Fat',
        grams: Math.round(Number(fat) || 0),
        kcal: Math.max(0, Number(fat) || 0) * 9,
        color: colors.fat,
      },
    ];

    const total = values.reduce((s, v) => s + v.kcal, 0);
    if (total <= 0) {
      return {
        slices: values.map((v) => ({ ...v, pct: 0, start: 0, end: 0, path: null })),
      };
    }

    const raw = values.map((v) => (v.kcal / total) * 100);
    const floored = raw.map((p) => Math.floor(p));
    let rem = 100 - floored.reduce((a, b) => a + b, 0);
    const order = raw
      .map((p, i) => ({ i, frac: p - floored[i] }))
      .sort((a, b) => b.frac - a.frac);
    const pcts = [...floored];
    for (let n = 0; n < rem; n += 1) pcts[order[n % order.length].i] += 1;

    const active = values.filter((_, i) => pcts[i] > 0).length;
    const gapBudget = active > 1 ? GAP * active : 0;
    const usable = 360 - gapBudget;

    let angle = 0;
    const slices = values.map((v, i) => {
      const pct = pcts[i];
      if (pct <= 0) {
        return { ...v, pct: 0, start: 0, end: 0, path: null };
      }
      const sweep = (pct / 100) * usable;
      const start = angle + (active > 1 ? GAP / 2 : 0);
      const end = start + sweep;
      angle += sweep + (active > 1 ? GAP : 0);
      return {
        ...v,
        pct,
        start,
        end,
        path: donutPath(CX, CY, R_OUT, R_IN, start, end),
      };
    });

    return { slices };
  }, [carbs, protein, fat]);

  const track = isDark ? '#2A2A2A' : '#EEF1F4';
  const hole = theme.cardBg;
  const hasData = slices.some((s) => s.pct > 0);

  return (
    <View style={styles.row}>
      <View style={[styles.chartWrap, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Circle
            cx={CX}
            cy={CY}
            r={(R_OUT + R_IN) / 2}
            stroke={track}
            strokeWidth={R_OUT - R_IN}
            fill="none"
          />
          {hasData
            ? slices.map((s) =>
                s.path ? <Path key={s.key} d={s.path} fill={s.color} /> : null,
              )
            : null}
          <Circle cx={CX} cy={CY} r={R_IN - 0.5} fill={hole} />
        </Svg>
      </View>

      <View style={styles.legend}>
        {slices.map((s) => (
          <View key={s.key} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <View style={styles.legendText}>
              <Text style={[styles.legendLabel, { color: theme.text, fontFamily: snPro('700') }]}>
                {s.label}
              </Text>
              <Text style={[styles.legendSub, { color: theme.muted, fontFamily: snPro('500') }]}>
                {s.pct}% of energy
              </Text>
            </View>
            <Text style={[styles.legendVal, { color: s.color, fontFamily: snPro('800') }]}>
              {s.grams}g
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  chartWrap: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flex: 1,
    gap: 14,
    minWidth: 0,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
  legendText: {
    flex: 1,
    minWidth: 0,
  },
  legendLabel: {
    fontSize: 13,
  },
  legendSub: {
    fontSize: 11,
    marginTop: 1,
  },
  legendVal: {
    fontSize: 16,
  },
});
