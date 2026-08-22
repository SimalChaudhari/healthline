import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { themeColors } from '../config/colors';

export default function ScreenShell({ children, edges = ['top'] }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.pageBg }]} edges={edges}>
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
});
