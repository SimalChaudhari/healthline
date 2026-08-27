import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { X, Barcode, Camera, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import CameraPermissionGate from '../../components/Diary/CameraPermissionGate';
import { lookupBarcode, scanBarcodeFromImageUri } from '../../services/barcodeService';
import { SafeAreaTop } from '../../components/common/ScreenShell';
import AppButton from '../../components/common/AppButton';

function ScanErrorBanner({ message, onRetry, isDark }) {
  if (!message) return null;
  return (
    <View
      style={[
        styles.errorBox,
        {
          backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : `${colors.danger}10`,
          borderColor: `${colors.danger}33`,
        },
      ]}
    >
      <Text style={[styles.errorText, { color: isDark ? '#FFFFFF' : colors.danger, fontFamily: snPro('600') }]}>
        {message}
      </Text>
      <AppButton variant="ghost" ghostTone="primary" label="Try again" onPress={onRetry} />
    </View>
  );
}

export default function BarcodeScanScreen({ navigation, route }) {
  const meal = route.params?.meal || 'snacks';
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [lastCode, setLastCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scannedRef = useRef(false);

  const clearError = useCallback(() => {
    setError('');
    setLastCode(null);
    scannedRef.current = false;
  }, []);

  useFocusEffect(
    useCallback(() => {
      scannedRef.current = false;
      setLastCode(null);
      setLoading(false);
      setError('');
    }, []),
  );

  const openFoodDetail = useCallback(
    (food, barcode) => {
      navigation.navigate('FoodDetail', {
        id: food.id,
        meal,
        food,
        barcode,
      });
    },
    [meal, navigation],
  );

  const resolveBarcode = useCallback(
    async (data, type = 'unknown') => {
      if (scannedRef.current) return;
      scannedRef.current = true;
      setLastCode({ data, type });
      setLoading(true);
      setError('');

      try {
        const food = await lookupBarcode(data);
        setLoading(false);
        openFoodDetail(food, data);
      } catch (e) {
        setLoading(false);
        setError(e?.message || 'Lookup failed');
        scannedRef.current = false;
      }
    },
    [openFoodDetail],
  );

  const pickBarcodeImage = useCallback(async () => {
    try {
      setError('');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setError('Gallery permission denied. Enable Photos access to upload a barcode image.');
        return;
      }

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: Platform.OS !== 'web',
        aspect: [4, 1],
      });

      if (picked.canceled || !picked.assets?.[0]?.uri) return;

      setLoading(true);
      const scanned = await scanBarcodeFromImageUri(picked.assets[0].uri);
      setLoading(false);
      await resolveBarcode(scanned.data, scanned.type || 'image');
    } catch (e) {
      setLoading(false);
      scannedRef.current = false;
      setError(e?.message || 'Could not read barcode from photo');
    }
  }, [resolveBarcode]);

  const onBarcodeScanned = useCallback(
    ({ data, type }) => {
      resolveBarcode(data, type);
    },
    [resolveBarcode],
  );

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: c.pageBg }}>
        <CameraPermissionGate
          permission={permission}
          requestPermission={requestPermission}
          title="Camera for barcodes"
          message="Scan live with camera or upload a clear barcode photo — crop tight to the black bars, straight and in focus."
          onClose={() => navigation.goBack()}
          onUploadImage={pickBarcodeImage}
          uploadLabel="Upload clear barcode photo"
          uploadLoading={loading}
          uploadHint="Tip: crop so only the barcode fills the frame — numbers below the bars should be visible."
          footer={
            <ScanErrorBanner message={error} onRetry={clearError} isDark={isDark} />
          }
        />
      </View>
    );
  }

  const centerMessage = loading
    ? `Looking up ${lastCode?.data || 'product'}…`
    : error
      ? error
      : 'Align barcode here';

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'],
        }}
        onBarcodeScanned={loading ? undefined : onBarcodeScanned}
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
          Point at any packaged food label — nutrition loads live after scan or upload.
        </Text>

        <View style={styles.finder}>
          <View style={[styles.laser, loading && { backgroundColor: colors.primary }]} />
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <View style={styles.center}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : error ? (
              <AlertCircle size={28} color={colors.danger} />
            ) : (
              <Barcode size={28} color="#F5C542" />
            )}
            <Text style={[styles.centerLbl, { fontFamily: snPro('600') }]}>{centerMessage}</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          {error ? (
            <AppButton variant="overlay" label="Try again" onPress={clearError} />
          ) : null}
          <AppButton
            variant="overlay"
            label="Upload clear barcode photo"
            onPress={pickBarcodeImage}
            loading={loading}
            disabled={loading}
          />
          <Text style={[styles.hint, { color: isDark ? 'rgba(255,255,255,0.5)' : c.muted }]}>
            {Platform.OS === 'web'
              ? 'Use a sharp photo · barcode centered · black bars clearly visible'
              : 'Crop tight to barcode · straight · in focus · EAN / UPC packaged food'}
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
    maxWidth: '92%',
  },
  centerLbl: { color: '#FFFFFF', marginTop: 10, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  bottom: { paddingBottom: 12, gap: 10 },
  errorBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    width: '100%',
  },
  errorText: { fontSize: 12, lineHeight: 17, textAlign: 'center' },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
