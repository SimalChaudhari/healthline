import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';

/**
 * Shared confirmation modal UI (theme-aware).
 * App-wide: use via `useConfirm()` from ConfirmContext — do not mount duplicates.
 */
export default function ConfirmModal({
  visible,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  onCancel,
  onConfirm,
}) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const accent = destructive ? colors.danger : colors.primary;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityRole="button" />
        <View style={[styles.sheet, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: destructive
                  ? `${colors.danger}18`
                  : isDark
                    ? 'rgba(0,112,224,0.18)'
                    : colors.primarySoft,
              },
            ]}
          >
            <AlertTriangle size={22} color={accent} />
          </View>
          <Text style={[styles.title, { color: c.text, fontFamily: FONT.nova }]}>{title}</Text>
          {message ? (
            <Text style={[styles.message, { color: c.muted, fontFamily: snPro('400') }]}>
              {message}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.btn,
                {
                  backgroundColor: isDark ? '#1C1C1E' : c.chip,
                  borderColor: c.border,
                  borderWidth: 1,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={[styles.btnText, { color: c.text, fontFamily: snPro('700') }]}
              >
                {cancelLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: accent, opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={[styles.btnText, styles.confirmText, { fontFamily: snPro('700') }]}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  sheet: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    gap: 10,
  },
  btn: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
  },
  confirmText: { color: '#FFFFFF' },
});
