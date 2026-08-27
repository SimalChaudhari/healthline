import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FONT } from '../../config/fonts';

/**
 * Circle avatar with Nova Round initial — same display font as screen titles.
 */
export default function AvatarInitial({
  name,
  size = 44,
  backgroundColor = '#0070E0',
  onPress,
  style,
  accessibilityLabel,
}) {
  const initial = (name || '?').trim().slice(0, 1).toUpperCase() || '?';
  const fontSize = Math.round(size * 0.46);

  const circle = (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize, fontFamily: FONT.nova }]}>{initial}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        {circle}
      </Pressable>
    );
  }

  return circle;
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
