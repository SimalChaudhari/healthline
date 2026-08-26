import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors } from '../../config/colors';

export default function AiBadge({ label = 'AI soon' }) {
  return (
    <View style={styles.badge}>
      <Sparkles size={11} color="#FFFFFF" />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.aiPurple,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
