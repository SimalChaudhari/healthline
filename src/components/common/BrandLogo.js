import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getBrandContent } from '../../config/brandContent';
import { FONT, snPro } from '../../config/fonts';

/** Brand logo — Health line (H) with green leaf accent on green theme. */
export default function BrandLogo({ size = 52, showName = false, style }) {
  const { brand, colors, isGreenBrand } = useTheme();
  const content = getBrandContent(brand);
  const radius = Math.round(size * 0.28);

  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient
        colors={isGreenBrand ? [colors.lime || '#7EC845', colors.primary] : [colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.mark, { width: size, height: size, borderRadius: radius }]}
      >
        {isGreenBrand ? (
          <Leaf size={size * 0.46} color="#FFFFFF" strokeWidth={2.2} />
        ) : (
          <Text style={[styles.letter, { fontSize: size * 0.44, fontFamily: FONT.nova }]}>
            {content.logoLetter}
          </Text>
        )}
      </LinearGradient>
      {showName ? (
        <View style={styles.textBlock}>
          <Text style={[styles.name, { color: colors.primaryDark || colors.primary, fontFamily: FONT.nova }]}>
            {content.appName}
          </Text>
          <Text style={[styles.tagline, { fontFamily: snPro('500') }]}>{content.tagline}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  mark: { alignItems: 'center', justifyContent: 'center' },
  letter: { color: '#FFFFFF', includeFontPadding: false },
  textBlock: { alignItems: 'center', marginTop: 12 },
  name: { fontSize: 28, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: '#6B7280', marginTop: 4 },
});
