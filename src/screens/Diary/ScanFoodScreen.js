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
import { useDiary } from '../../context/DiaryContext';
import { useTheme } from '../../context/ThemeContext';
import { useConfirm } from '../../context/ConfirmContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import AiBadge from '../../components/common/AiBadge';
import CameraPermissionGate from '../../components/Diary/CameraPermissionGate';
import AiResultCard from '../../components/Diary/AiResultCard';
import { parseFoodFromImage, hasAiKey } from '../../services/aiService';
import { AI_CONFIG } from '../../config/ai';
import { prepareMealImage } from '../../utils/prepareMealImage';
import { SafeAreaTop } from '../../components/common/ScreenShell';
import AppButton from '../../components/common/AppButton';

export default function ScanFoodScreen({ navigation, route }) {
  const meal = route.params?.meal || 'lunch';
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { confirm } = useConfirm();
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
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);
  const cancelledRef = useRef(false);
  const keyReady = hasAiKey();

  const resetPhoto = () => {
    cancelledRef.current = true;
    setLoading(false);
    setCapturing(false);
    setPhotoUri(null);
    setPhotoBase64(null);
    setResult(null);
    setError('');
    setSource(null);
  };

  const onCloseReview = async () => {
    const ok = await confirm({
      title: loading ? 'Cancel diagnosis?' : result ? 'Discard results?' : 'Discard photo?',
      message: loading
        ? 'AI is still reading this meal. Closing will stop and discard the photo.'
        : result
          ? 'Your nutrition estimate will be lost.'
          : 'This meal photo will be discarded.',
      confirmLabel: loading ? 'Yes, cancel' : 'Discard',
      cancelLabel: 'Keep going',
      destructive: true,
    });
    if (!ok) return;
    resetPhoto();
  };

  const runDiagnose = async ({ base64, mime, hint }) => {
    if (!keyReady) {
      setError('Add EXPO_PUBLIC_OPENROUTER_API_KEY in .env and restart Expo.');
      return;
    }
    if (!base64) {
      setError('No image data to analyze. Retake or pick another photo.');
      return;
    }
    cancelledRef.current = false;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const parsed = await parseFoodFromImage({
        base64,
        mimeType: mime || 'image/jpeg',
        note: hint ?? note,
      });
      if (cancelledRef.current) return;
      setResult(parsed);
    } catch (e) {
      if (cancelledRef.current) return;
      setError(e.message || 'AI diagnose failed');
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  };

  /** Compress + encode so camera and gallery both send a vision-safe JPEG. */
  const ingestPhoto = async (uri, from) => {
    const prepared = await prepareMealImage(uri);
    setPhotoUri(prepared.uri);
    setPhotoBase64(prepared.base64);
    setMimeType(prepared.mimeType);
    setSource(from);
    setResult(null);
    return prepared;
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
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (picked.canceled || !picked.assets?.[0]?.uri) return;

      setCapturing(true);
      const prepared = await ingestPhoto(picked.assets[0].uri, 'gallery');
      setCapturing(false);

      await runDiagnose({
        base64: prepared.base64,
        mime: prepared.mimeType,
        hint: note.trim(),
      });
    } catch (e) {
      setCapturing(false);
      setLoading(false);
      setError(e.message || 'Gallery upload failed');
    }
  };

  const capture = async () => {
    if (capturing || loading) return;
    try {
      setError('');
      setResult(null);
      setCapturing(true);

      const photo = await cameraRef.current?.takePictureAsync?.({
        quality: 0.8,
        skipProcessing: false,
        exif: false,
      });
      if (!photo?.uri) {
        setError('Could not capture photo. Try again.');
        setCapturing(false);
        return;
      }

      const prepared = await ingestPhoto(photo.uri, 'camera');
      setCapturing(false);

      await runDiagnose({
        base64: prepared.base64,
        mime: prepared.mimeType,
        hint: note.trim(),
      });
    } catch (e) {
      setCapturing(false);
      setLoading(false);
      setError(e.message || 'Capture failed');
    }
  };

  const analyzeAgain = () =>
    runDiagnose({
      base64: photoBase64,
      mime: mimeType,
      hint: note.trim(),
    });

  const logAll = () => {
    if (!result?.items?.length) return;
    result.items.forEach((food) => addFood(meal, food));
    navigation.navigate('Main', { screen: 'Diary' });
  };

  // Review / diagnose UI (camera capture OR gallery)
  if (photoUri || result || loading) {
    return (
      <View style={[styles.root, { backgroundColor: c.pageBg }]}>
        <SafeAreaView edges={['bottom']} style={[styles.safe, { backgroundColor: c.pageBg }]}>
          <SafeAreaTop color={c.pageBg} />
          <View style={styles.top}>
            <Pressable onPress={onCloseReview} style={[styles.close, { backgroundColor: c.chip }]}>
              <X size={20} color={c.text} />
            </Pressable>
            <AiBadge label={keyReady ? 'Nemotron' : 'Add API key'} />
            <View style={{ width: 36 }} />
          </View>

          <ScrollView contentContainerStyle={styles.reviewScroll} keyboardShouldPersistTaps="handled">
            {photoUri ? (
              <View
                style={[
                  styles.previewWrap,
                  { borderColor: c.border, backgroundColor: c.cardBg },
                ]}
              >
                <View style={[styles.previewStage, { backgroundColor: c.imageStage }]}>
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.preview}
                    resizeMode="contain"
                  />
                </View>
                <View
                  style={[
                    styles.previewTag,
                    {
                      backgroundColor: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.92)',
                      borderColor: isDark ? 'transparent' : c.border,
                      borderWidth: isDark ? 0 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.previewTagText,
                      { color: isDark ? '#FFFFFF' : c.text, fontFamily: snPro('700') },
                    ]}
                  >
                    {source === 'gallery' ? 'Gallery' : 'Camera'}
                  </Text>
                </View>
              </View>
            ) : null}

            <Text style={[styles.headline, { color: c.text, fontFamily: FONT.nova }]}>
              {loading ? 'Diagnosing…' : result ? 'Nutrition breakdown' : 'Meal photo'}
            </Text>
            <Text style={[styles.sub, { color: c.muted }]}>
              {source === 'gallery' ? 'Uploaded from gallery' : 'Captured with camera'}
              {' · '}
              {(result?.model || AI_CONFIG.visionModel).split('/').pop()}
            </Text>

            {loading ? (
              <View style={[styles.loadingBox, { backgroundColor: c.cardBg, borderColor: c.border, borderWidth: 1 }]}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={[styles.loadingText, { color: c.muted }]}>AI is reading your meal photo…</Text>
              </View>
            ) : null}

            {!result && !loading ? (
              <TextInput
                value={note}
                onChangeText={setNote}
                multiline
                placeholder="Optional note (helps if vision fails)"
                placeholderTextColor={c.muted}
                style={[
                  styles.noteInput,
                  {
                    fontFamily: snPro('400'),
                    color: c.text,
                    backgroundColor: c.cardBg,
                    borderColor: c.border,
                  },
                ]}
              />
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {result ? <AiResultCard result={result} /> : null}
          </ScrollView>

          <View style={[styles.bottom, { borderTopColor: c.border }]}>
            {!result && !loading ? (
              <AppButton
                label="Diagnose with AI"
                icon={Sparkles}
                onPress={analyzeAgain}
                disabled={!keyReady || !photoBase64}
              />
            ) : null}
            {result ? (
              <AppButton
                label={`Log ${result.items.length} food${result.items.length === 1 ? '' : 's'} · ${result.items.reduce((s, i) => s + i.calories, 0)} kcal`}
                onPress={logAll}
              />
            ) : null}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // No camera permission — still allow gallery upload
  if (!permission?.granted) {
    return (
      <View style={[styles.root, { backgroundColor: c.pageBg }]}>
        <CameraPermissionGate
          permission={permission}
          requestPermission={requestPermission}
          title="Camera for meal scan"
          message="Allow camera, or upload a meal photo from your gallery — AI will diagnose it."
          onClose={() => navigation.goBack()}
        />
        <View style={styles.gateGallery}>
          <AppButton
            label="Upload from gallery"
            icon={ImageIcon}
            onPress={pickFromGallery}
            disabled={loading || capturing}
            loading={loading || capturing}
          />
          {error ? <Text style={[styles.error, { textAlign: 'center' }]}>{error}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
      <View style={styles.dim} pointerEvents="none" />

      <SafeAreaView edges={['bottom']} style={styles.safe}>
        <SafeAreaTop color={c.pageBg} />
        <View style={styles.top}>
          <Pressable onPress={() => navigation.goBack()} style={[styles.close, { backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.92)' }]}>
            <X size={20} color={isDark ? '#FFFFFF' : c.text} />
          </Pressable>
          <AiBadge label={keyReady ? 'Nemotron' : 'Add API key'} />
          <Pressable
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            style={[styles.close, { backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.92)' }]}
          >
            <Camera size={18} color={isDark ? '#FFFFFF' : c.text} />
          </Pressable>
        </View>

        <Text style={[styles.headline, { color: isDark ? '#FFFFFF' : c.text, fontFamily: FONT.nova }]}>
          Scan your food
        </Text>
        <Text style={[styles.sub, { color: isDark ? 'rgba(255,255,255,0.8)' : c.muted }]}>
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
          <AppButton
            label="Capture & diagnose"
            onPress={capture}
            disabled={capturing || loading}
            loading={capturing || loading}
          />
          <AppButton
            variant="overlay"
            label="Upload from gallery"
            icon={ImageIcon}
            onPress={pickFromGallery}
            disabled={capturing || loading}
          />
          <Text style={[styles.hint, { color: isDark ? 'rgba(255,255,255,0.55)' : c.muted }]}>
            {Platform.OS === 'web'
              ? 'Browser may ask for camera / file permission.'
              : 'Photos are compressed, then sent to a vision AI model'}
          </Text>
          {error ? <Text style={[styles.error, { textAlign: 'center' }]}>{error}</Text> : null}
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
  headline: {
    fontSize: 26,
    marginTop: 20,
  },
  sub: { fontSize: 14, marginTop: 8, lineHeight: 20 },
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
    padding: 8,
  },
  previewStage: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    height: 180,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  previewTag: {
    position: 'absolute',
    top: 18,
    left: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  previewTagText: { fontSize: 11 },
  loadingBox: {
    marginTop: 16,
    padding: 20,
    alignItems: 'center',
    borderRadius: 14,
  },
  loadingText: { marginTop: 12, fontSize: 13 },
  noteInput: {
    marginTop: 12,
    minHeight: 80,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  error: { color: colors.danger, marginTop: 10, fontSize: 13 },
  bottom: { paddingBottom: 12, gap: 10, borderTopWidth: 1, paddingTop: 12 },
  gateGallery: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
  },
  hint: { textAlign: 'center', marginTop: 4, fontSize: 12 },
});
