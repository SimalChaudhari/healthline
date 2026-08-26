import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Barcode, Check, Camera } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDiary } from '../../context/DiaryContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import CameraPermissionGate from '../../components/Diary/CameraPermissionGate';
import { getFoodById } from '../../data/foods';
import { SafeAreaTop } from '../../components/common/ScreenShell';
import AppButton from '../../components/common/AppButton';

export default function BarcodeScanScreen({ navigation, route }) {
  const meal = route.params?.meal || 'snacks';
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { addFood } = useDiary();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [scanned, setScanned] = useState(false);
  const [code, setCode] = useState(null);
  const demo = getFoodById('f1');

  const logDemo = () => {
    if (demo) addFood(meal, demo);
    navigation.navigate('Main', { screen: 'Diary' });
  };

  const onBarcodeScanned = useCallback(
    ({ data, type }) => {
      if (scanned) return;
      setScanned(true);
      setCode({ data, type });
    },
    [scanned],
  );

  if (!permission?.granted) {
    return (
      <CameraPermissionGate
        permission={permission}
        requestPermission={requestPermission}
        title="Camera for barcodes"
        message="Allow camera access to scan product barcodes. Demo food will log after a successful scan."
        onClose={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'],
        }}
        onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
      />
      <View style={styles.dim} pointerEvents="none" />

      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <SafeAreaTop color={c.pageBg} />
        <View style={styles.top}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.close, { backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.92)' }]}
          >
            <X size={20} color={isDark ? '#FFFFFF' : c.text} />
          </Pressable>
          <Text style={[styles.topTitle, { color: isDark ? '#FFFFFF' : c.text, fontFamily: snPro('700') }]}>
            Barcode
          </Text>
          <Pressable
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            style={[styles.close, { backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.92)' }]}
          >
            <Camera size={18} color={isDark ? '#FFFFFF' : c.text} />
          </Pressable>
        </View>

        <Text style={[styles.headline, { color: isDark ? '#FFFFFF' : c.text, fontFamily: FONT.nova }]}>
          Scan a barcode
        </Text>
        <Text style={[styles.sub, { color: isDark ? 'rgba(255,255,255,0.8)' : c.muted }]}>
          Align a product barcode in the frame. Camera permission is required.
        </Text>

        <View style={styles.finder}>
          <View style={[styles.laser, scanned && styles.laserDone]} />
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <View style={styles.center}>
            {scanned ? <Check size={28} color={colors.accent} /> : <Barcode size={28} color="#F5C542" />}
            <Text style={[styles.centerLbl, { fontFamily: snPro('600') }]}>
              {scanned
                ? `${demo?.name || 'Product'} · ${code?.data || 'code'}`
                : 'Align barcode here'}
            </Text>
          </View>
        </View>

        <View style={styles.bottom}>
          {!scanned ? (
            <AppButton
              variant="overlay"
              label="Use demo barcode"
              onPress={() => {
                setScanned(true);
                setCode({ data: 'DEMO-0001', type: 'manual' });
              }}
            />
          ) : (
            <AppButton
              label={`Log ${demo?.name} · ${demo?.calories} kcal`}
              onPress={logDemo}
            />
          )}
          {scanned ? (
            <AppButton
              variant="ghost"
              ghostTone="primary"
              label="Scan again"
              onPress={() => {
                setScanned(false);
                setCode(null);
              }}
              style={{ marginTop: 0 }}
            />
          ) : null}
          <Text style={[styles.hint, { color: isDark ? 'rgba(255,255,255,0.5)' : c.muted }]}>
            {Platform.OS === 'web'
              ? 'Browser may ask for camera permission.'
              : 'Live camera · barcode types: EAN / UPC / Code128'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  safe: { flex: 1, paddingHorizontal: 20 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontSize: 15 },
  headline: { fontSize: 26, marginTop: 20 },
  sub: { fontSize: 14, marginTop: 8, lineHeight: 20 },
  finder: {
    flex: 1,
    marginVertical: 28,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  laser: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: '#F5C542',
    top: '48%',
  },
  laserDone: { backgroundColor: colors.accent },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#FFFFFF',
  },
  tl: { top: 20, left: 20, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 20, right: 20, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 20, left: 20, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 20, right: 20, borderBottomWidth: 3, borderRightWidth: 3 },
  center: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  centerLbl: { color: '#FFFFFF', marginTop: 10, fontSize: 13, textAlign: 'center' },
  bottom: { paddingBottom: 12, gap: 10 },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
