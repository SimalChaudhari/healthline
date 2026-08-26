import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { snPro } from '../../config/fonts';

const SIZES = {
  lg: { height: 52, fontSize: 15, iconSize: 16, paddingHorizontal: 14 },
  md: { height: 48, fontSize: 14, iconSize: 15, paddingHorizontal: 12 },
  sm: { height: 34, fontSize: 12, iconSize: 13, paddingHorizontal: 10, paddingVertical: 0, minWidth: 88 },
};

/**
 * Shared pill button — primary, secondary, ghost, overlay.
 * Icon + label stay on one line; font size auto-shrinks on narrow widths.
 */
export default function AppButton({
  variant = 'primary',
  size,
  label,
  children,
  onPress,
  disabled = false,
  loading = false,
  icon: Icon,
  ghostTone = 'muted',
  style,
  textStyle,
  minWidth,
  ...rest
}) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { width } = useWindowDimensions();
  const compact = width < 380;

  const resolvedSize = size ?? (variant === 'secondary' ? 'md' : variant === 'ghost' ? null : 'lg');
  const base = resolvedSize ? SIZES[resolvedSize] : { fontSize: 14, iconSize: 15, paddingHorizontal: 12 };
  const metrics = {
    ...base,
    fontSize: compact && base.fontSize ? Math.max(11, base.fontSize - 1) : base.fontSize,
    iconSize: compact && base.iconSize ? Math.max(12, base.iconSize - 1) : base.iconSize,
    paddingHorizontal: compact ? Math.min(base.paddingHorizontal || 12, 10) : base.paddingHorizontal,
  };
  const content = label ?? children;

  const spinnerColor =
    variant === 'primary' || resolvedSize === 'sm' ? '#FFFFFF' : colors.primary;

  const iconColor =
    variant === 'primary'
      ? '#FFFFFF'
      : variant === 'overlay'
        ? isDark
          ? '#FFFFFF'
          : c.text
        : variant === 'ghost'
          ? ghostTone === 'primary'
            ? colors.primary
            : c.muted
          : c.text;

  const variantStyle = (() => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: c.chip,
          borderWidth: 1,
          borderColor: c.border,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          marginTop: 14,
          paddingVertical: 8,
          paddingHorizontal: 8,
        };
      case 'overlay':
        return {
          backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : c.cardBg,
          borderWidth: isDark ? 0 : 1,
          borderColor: c.border,
        };
      default:
        return { backgroundColor: colors.primary };
    }
  })();

  const textColor =
    variant === 'primary'
      ? '#FFFFFF'
      : variant === 'overlay'
        ? isDark
          ? '#FFFFFF'
          : c.text
        : variant === 'ghost'
          ? ghostTone === 'primary'
            ? colors.primary
            : c.muted
          : c.text;

  const weight = variant === 'ghost' ? '600' : '700';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        metrics.height != null && { height: metrics.height },
        metrics.paddingHorizontal != null && { paddingHorizontal: metrics.paddingHorizontal },
        metrics.paddingVertical != null && { paddingVertical: metrics.paddingVertical },
        metrics.minWidth != null && { minWidth: metrics.minWidth },
        minWidth != null && { minWidth },
        variantStyle,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && { opacity: 0.9 },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <>
          {Icon ? <Icon size={metrics.iconSize} color={iconColor} style={styles.icon} /> : null}
          {content ? (
            typeof content === 'string' ? (
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
                allowFontScaling
                style={[
                  styles.text,
                  {
                    color: textColor,
                    fontSize: metrics.fontSize,
                    fontFamily: snPro(weight),
                    lineHeight: (metrics.fontSize || 14) + 4,
                  },
                  textStyle,
                ]}
              >
                {content}
              </Text>
            ) : (
              content
            )
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 6,
    overflow: 'hidden',
  },
  icon: {
    flexShrink: 0,
  },
  text: {
    flexShrink: 1,
    textAlign: 'center',
    includeFontPadding: false,
  },
  disabled: {
    opacity: 0.5,
  },
});
