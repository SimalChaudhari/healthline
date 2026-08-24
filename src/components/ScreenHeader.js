import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../config/colors';
import { FONT, snPro } from '../config/fonts';

/** Shared top bar for stack screens opened from More / tabs. */
export default function ScreenHeader({ title, onBack, theme, right }) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onBack} hitSlop={8} style={[styles.back, { backgroundColor: theme.chip }]}>
        <ChevronLeft size={20} color={theme.text} />
      </Pressable>
      <Text style={[styles.title, { color: theme.text, fontFamily: FONT.nova }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right || <View style={styles.spacer} />}</View>
    </View>
  );
}

export function SaveButton({ onPress, label = 'Save' }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.save, { opacity: pressed ? 0.88 : 1 }]}>
      <Text style={[styles.saveText, { fontFamily: snPro('700') }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  right: { minWidth: 36, alignItems: 'flex-end' },
  spacer: { width: 36 },
  save: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
  },
  saveText: { color: '#FFFFFF', fontSize: 13 },
});
