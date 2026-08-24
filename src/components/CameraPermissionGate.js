import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Camera } from 'lucide-react-native';
import { colors } from '../config/colors';
import { FONT, snPro } from '../config/fonts';

/** Shown while permission loads / denied / before grant. */
export default function CameraPermissionGate({
  permission,
  requestPermission,
  title = 'Camera access needed',
  message = 'Allow camera access to scan food and barcodes.',
  onClose,
}) {
  if (!permission) {
    return (
      <View style={styles.wrap}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.msg, { fontFamily: snPro('500') }]}>Checking camera permission…</Text>
        {onClose ? (
          <Pressable onPress={onClose} style={styles.secondary}>
            <Text style={[styles.secondaryText, { fontFamily: snPro('600') }]}>Close</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (permission.granted) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Camera size={28} color={colors.primary} />
      </View>
      <Text style={[styles.title, { fontFamily: FONT.nova }]}>{title}</Text>
      <Text style={[styles.msg, { fontFamily: snPro('400') }]}>{message}</Text>
      <Pressable
        onPress={requestPermission}
        style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
      >
        <Text style={[styles.ctaText, { fontFamily: snPro('700') }]}>Allow camera</Text>
      </Pressable>
      {onClose ? (
        <Pressable onPress={onClose} style={styles.secondary}>
          <Text style={[styles.secondaryText, { fontFamily: snPro('600') }]}>Not now</Text>
        </Pressable>
      ) : null}
      {!permission.canAskAgain ? (
        <Text style={styles.hint}>
          Permission blocked. Open phone Settings → Apps → Healthline → Permissions → Camera.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(0,112,224,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  msg: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
  },
  cta: {
    backgroundColor: colors.primary,
    height: 52,
    paddingHorizontal: 28,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  ctaText: { color: '#FFFFFF', fontSize: 16 },
  secondary: { marginTop: 14, padding: 8 },
  secondaryText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  hint: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
