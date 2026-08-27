import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { FONT, snPro } from '../../config/fonts';

const sheetShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
  },
  android: { elevation: 16 },
  default: {},
});

export default function SettingsSheetModal({
  visible,
  title,
  subtitle,
  onClose,
  children,
  maxHeightRatio = 0.82,
}) {
  const { isDark, colors, themeColors: c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
        <View
          style={[
            styles.sheet,
            sheetShadow,
            {
              backgroundColor: c.cardBg,
              borderColor: c.border,
              paddingBottom: Math.max(insets.bottom, 16),
              maxHeight: `${Math.round(maxHeightRatio * 100)}%`,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: isDark ? '#3A3A3C' : '#D1D5DB' }]} />

          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.title, { color: c.text, fontFamily: FONT.nova }]}>{title}</Text>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: c.muted, fontFamily: snPro('400') }]}>{subtitle}</Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [
                styles.closeBtn,
                {
                  backgroundColor: isDark ? '#1C1C1E' : c.chip,
                  borderColor: c.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <X size={18} color={c.muted} />
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
            bounces={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    zIndex: 2,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
});
