import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/**
 * Calorie / progress ring. Uses strokeDashoffset + SVG rotate(cx,cy)
 * so the arc fills correctly on web, iOS, and Android.
 */
export default function ProgressRing({
  size = 168,
  stroke = 14,
  progress = 0,
  color = '#0070E0',
  trackColor = '#EEF1F4',
  children,
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, Number(progress) || 0));
  const center = size / 2;
  // Hide near-zero arcs — round caps otherwise paint a false "dot" at 12 o'clock.
  const showArc = clamped > 0.002;
  const dashOffset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        {showArc ? (
          <Circle
            cx={center}
            cy={center}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        ) : null}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
