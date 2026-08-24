import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { X, ScanLine, Camera, Sparkles, Image as ImageIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDiary } from '../context/DiaryContext';
import { colors } from '../config/colors';
import { FONT, snPro } from '../config/fonts';
import AiBadge from '../components/AiBadge';
import CameraPermissionGate from '../components/CameraPermissionGate';
import AiResultCard from '../components/AiResultCard';
import { parseFoodFromImage, hasAiKey } from '../services/aiService';
import { AI_CONFIG } from '../config/ai';

function mimeFromUri(uri = '') {
  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export default function ScanFoodScreen({ navigation, route }) {
  const meal = route.params?.meal || 'lunch';
  const { addFood } = useDiary();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [source, setSource] = useState(null); // camera | gallery
  const cameraRef = useRef(null);
  const keyReady = hasAiKey();

  const resetPhoto = () => {
    setPhotoUri(null);
    setPhotoBase64(null);
    setResult(null);
    setError('');
    setSource(null);
  };

  const runDiagnose = async ({ base64, mime, hint }) => {
    if (!keyReady) {
      setError('Add EXPO_PUBLIC_OPENROUTER_API_KEY in .env and restart Expo.');
      return;
    }
    if (!base64) {
      setError('No image data to analyze.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const parsed = await parseFoodFromImage({
        base64,
        mimeType: mime || 'image/jpeg',
        note: hint || note,
      });
      setResult(parsed);
    } catch (e) {
      setError(e.message || 'AI diagnose failed');
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      setError('');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setError('Gallery permission denied. Enable Photos access in Settings.');
        return;
      }

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.55,
        base64: true,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (picked.canceled || !picked.assets?.[0]) return;

      const asset = picked.assets[0];
      const mime = asset.mimeType || mimeFromUri(asset.uri);
      setPhotoUri(asset.uri);
      setPhotoBase64(asset.base64 || null);
      setMimeType(mime);
      setSource('gallery');
      setResult(null);

      // Upload → auto diagnose (vision-first; no vague text that forces "Mixed meal")
      if (asset.base64) {
        await runDiagnose({
          base64: asset.base64,
          mime,
          hint: note.trim(),
        });
      } else {
        setError('Could not read image data. Try another photo.');
      }
    } catch (e) {
      setError(e.message || 'Gallery upload failed');
    }
  };

  const capture = async () => {
    try {
      setError('');
      setResult(null);
      const photo = await cameraRef.current?.takePictureAsync?.({
        quality: 0.55,
        base64: true,
        skipProcessing: true,
      });
      if (!photo?.uri) {
        setError('Could not capture photo');
        return;
      }
      setPhotoUri(photo.uri);
      setPhotoBase64(photo.base64 || null);
      setMimeType('image/jpeg');
      setSource('camera');
      if (!note.trim()) setNote('');

      if (photo.base64 && keyReady) {
        await runDiagnose({
          base64: photo.base64,
          mime: 'image/jpeg',
          hint: note.trim(),
        });
      }
    } catch (e) {
      setError(e.message || 'Capture failed');
    }
  };

  const analyzeAgain = () =>
    runDiagnose({
      base64: photoBase64,
      mime: mimeType,
      hint: note.trim() || 'Meal photo',
    });

  const logAll = () => {
    if (!result?.items?.length) return;
    result.items.forEach((food) => addFood(meal, food));
    navigation.navigate('Main', { screen: 'Diary' });
  };

  // Review / diagnose UI (camera capture OR gallery)
  if (photoUri || result || loading) {
    return (
      <View style={styles.root}>
        <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
          <View style={styles.top}>
            <Pressable onPress={resetPhoto} style={styles.close}>
              <X size={20} color="#FFFFFF" />
            </Pressable>
            <AiBadge label={keyReady ? 'Nemotron' : 'Add API key'} />
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.reviewScroll} keyboardShouldPersistTaps="handled">
            {photoUri ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: photoUri }} style={styles.preview} />
                <View style={styles.previewTag}>
                  <Text style={[styles.previewTagText, { fontFamily: snPro('700') }]}>
                    {source === 'gallery' ? 'Gallery' : 'Camera'}
                  </Text>
                </View>
              </View>
            ) : null}

            <Text style={[styles.headline, { fontFamily: FONT.nova }]}>
              {loading ? 'Diagnosing…' : result ? 'Nutrition breakdown' : 'Meal photo'}
            </Text>
            <Text style={styles.sub}>
              {source === 'gallery' ? 'Uploaded from gallery' : 'Captured with camera'}
              {' · '}
              {AI_CONFIG.model.split('/').pop()}
            </Text>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingText}>AI is reading your meal photo…</Text>
              </View>
            ) : null}

            {!result && !loading ? (
              <TextInput
                value={note}
                onChangeText={setNote}
                multiline
                placeholder="Optional note (helps if vision fails)"
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={[styles.noteInput, { fontFamily: snPro('400') }]}
              />
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {result ? <AiResultCard result={result} /> : null}
          </ScrollView>

          <View style={styles.bottom}>
            {!result && !loading ? (
              <Pressable
                style={[styles.cta, (!keyReady || !photoBase64) && styles.ctaDisabled]}
                onPress={analyzeAgain}
                disabled={!keyReady || !photoBase64}
              >
                <Sparkles size={16} color="#FFFFFF" />
                <Text style={[styles.ctaText, { fontFamily: snPro('700') }]}>Diagnose with AI</Text>
              </Pressable>
            ) : null}
            {result ? (
              <Pressable style={styles.cta} onPress={logAll}>
                <Text style={[styles.ctaText, { fontFamily: snPro('700') }]}>
                  Log {result.items.length} food{result.items.length === 1 ? '' : 's'} ·{' '}
                  {result.items.reduce((s, i) => s + i.calories, 0)} kcal
                </Text>
              </Pressable>
            ) : null}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // No camera permission — still allow gallery upload
  if (!permission?.granted) {
    return (
      <View style={styles.root}>
        <CameraPermissionGate
          permission={permission}
          requestPermission={requestPermission}
          title="Camera for meal scan"
          message="Allow camera, or upload a meal photo from your gallery — AI will diagnose it."
          onClose={() => navigation.goBack()}
        />
        <View style={styles.gateGallery}>
          <Pressable
            style={[styles.cta, (!keyReady || loading) && styles.ctaDisabled]}
            onPress={pickFromGallery}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <ImageIcon size={16} color="#FFFFFF" />
                <Text style={[styles.ctaText, { fontFamily: snPro('700') }]}>Upload from gallery</Text>
              </>
            )}
          </Pressable>
          {error ? <Text style={[styles.error, { textAlign: 'center' }]}>{error}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
      <View style={styles.dim} pointerEvents="none" />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <View style={styles.top}>
          <Pressable onPress={() => navigation.goBack()} style={styles.close}>
            <X size={20} color="#FFFFFF" />
          </Pressable>
          <AiBadge label={keyReady ? 'Nemotron' : 'Add API key'} />
          <Pressable
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            style={styles.close}
          >
            <Camera size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={[styles.headline, { fontFamily: FONT.nova }]}>Scan your food</Text>
        <Text style={styles.sub}>
          Capture or upload a meal photo — AI diagnoses calories & macros.
        </Text>

        <View style={styles.finder}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
          <View style={styles.box}>
            <ScanLine size={28} color="#F5C542" />
            <Text style={[styles.boxLbl, { fontFamily: snPro('700') }]}>Live camera</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <Pressable
            style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.9 : 1 }]}
            onPress={capture}
          >
            <Text style={[styles.ctaText, { fontFamily: snPro('700') }]}>Capture & diagnose</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondary, { opacity: pressed ? 0.9 : 1 }]}
            onPress={pickFromGallery}
          >
            <ImageIcon size={16} color="#FFFFFF" />
            <Text style={[styles.ctaText, { fontFamily: snPro('700') }]}>Upload from gallery</Text>
          </Pressable>
          <Text style={styles.hint}>
            {Platform.OS === 'web'
              ? 'Browser may ask for camera / file permission.'
              : 'Gallery upload auto-runs AI diagnose'}
          </Text>
          {error ? <Text style={[styles.error, { textAlign: 'center' }]}>{error}</Text> : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0B0B' },
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 26,
    marginTop: 20,
  },
  sub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 8, lineHeight: 20 },
  finder: {
    flex: 1,
    marginVertical: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    borderWidth: 2,
    borderColor: '#F5C542',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  boxLbl: { color: '#F5C542', marginTop: 8 },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#FFFFFF',
  },
  tl: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3 },
  reviewScroll: { paddingBottom: 16 },
  previewWrap: {
    marginTop: 12,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  preview: {
    width: '100%',
    height: 180,
    backgroundColor: '#1A1A1A',
  },
  previewTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  previewTagText: { color: '#FFFFFF', fontSize: 11 },
  loadingBox: {
    marginTop: 16,
    padding: 20,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  loadingText: { color: 'rgba(255,255,255,0.75)', marginTop: 12, fontSize: 13 },
  noteInput: {
    marginTop: 12,
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#FFFFFF',
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  error: { color: colors.danger, marginTop: 10, fontSize: 13 },
  bottom: { paddingBottom: 12, gap: 10 },
  gateGallery: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
  },
  cta: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    height: 52,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: '#FFFFFF', fontSize: 16 },
  hint: { color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 4, fontSize: 12 },
});
