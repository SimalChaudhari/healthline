import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { themeColors } from '../../config/colors';
import { useSafeTop } from '../../utils/safeArea';

/** Paints the status-bar / notch zone with the current theme background. */
export function SafeAreaTop({ color }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const topPad = useSafeTop();
  if (topPad <= 0) return null;
  return <View style={{ height: topPad, backgroundColor: color ?? c.pageBg }} />;
}

export default function ScreenShell({ children, edges = ['top'] }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const wantsTop = !edges || edges.includes('top');

  return (
    <View style={[styles.root, { backgroundColor: c.pageBg }]}>
      {wantsTop ? <SafeAreaTop color={c.pageBg} /> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
});
