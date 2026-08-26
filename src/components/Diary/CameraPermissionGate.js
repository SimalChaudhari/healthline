import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import { SafeAreaTop } from '../common/ScreenShell';
import AppButton from '../common/AppButton';

/** Shown while permission loads / denied / before grant. */
export default function CameraPermissionGate({
  permission,
  requestPermission,
  title = 'Camera access needed',
  message = 'Allow camera access to scan food and barcodes.',
  onClose,
}) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);

  if (!permission) {
    return (
      <View style={[styles.root, { backgroundColor: c.pageBg }]}>
        <SafeAreaTop color={c.pageBg} />
        {onClose ? (
          <View style={styles.topBar}>
            <Pressable onPress={onClose} hitSlop={8} style={[styles.backBtn, { backgroundColor: c.chip }]}>
              <ChevronLeft size={22} color={c.text} />
            </Pressable>
          </View>
        ) : null}
        <View style={styles.wrap}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.msg, { color: c.muted, fontFamily: snPro('500') }]}>
            Checking camera permission…
          </Text>
        </View>
      </View>
    );
  }

  if (permission.granted) return null;

  return (
    <View style={[styles.root, { backgroundColor: c.pageBg }]}>
      <SafeAreaTop color={c.pageBg} />
      {onClose ? (
        <View style={styles.topBar}>
          <Pressable onPress={onClose} hitSlop={8} style={[styles.backBtn, { backgroundColor: c.chip }]}>
            <ChevronLeft size={22} color={c.text} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.wrap}>
        <View style={[styles.icon, { backgroundColor: isDark ? 'rgba(0,112,224,0.18)' : colors.primarySoft }]}>
          <Camera size={28} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: c.text, fontFamily: FONT.nova }]}>{title}</Text>
        <Text style={[styles.msg, { color: c.muted, fontFamily: snPro('400') }]}>{message}</Text>
        <AppButton label="Allow camera" onPress={requestPermission} minWidth={200} />
        {onClose ? (
          <AppButton variant="ghost" label="Not now" onPress={onClose} />
        ) : null}
        {!permission.canAskAgain ? (
          <Text style={[styles.hint, { color: c.muted }]}>
            Permission blocked. Open phone Settings → Apps → Healthline → Permissions → Camera.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  msg: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
