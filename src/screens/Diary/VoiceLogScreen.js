import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Mic, Sparkles, Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { useConfirm } from '../../context/ConfirmContext';
import { themeColors, colors } from '../../config/colors';
import { snPro } from '../../config/fonts';
import AiBadge from '../../components/common/AiBadge';
import AiResultCard from '../../components/Diary/AiResultCard';
import ScreenHeader from '../../components/common/ScreenHeader';
import { parseFoodFromText, hasAiKey } from '../../services/aiService';
import { AI_CONFIG } from '../../config/ai';
import { SafeAreaTop } from '../../components/common/ScreenShell';
import AppButton from '../../components/common/AppButton';

const DEMO_LINE = 'I had 1 cup of Greek yogurt, honey, and some grapes.';
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export default function VoiceLogScreen({ navigation, route }) {
  const meal = route.params?.meal || 'snacks';
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { confirm } = useConfirm();
  const { addFood } = useDiary();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const keyReady = hasAiKey();

  const onBack = async () => {
    if (loading || result || transcript.trim()) {
      const ok = await confirm({
        title: loading ? 'Cancel analysis?' : 'Leave voice log?',
        message: loading
          ? 'AI is still working. Leaving will discard this estimate.'
          : 'Your transcript and results on this screen will be lost.',
        confirmLabel: loading ? 'Yes, leave' : 'Leave',
        cancelLabel: 'Stay',
        destructive: true,
      });
      if (!ok) return;
    }
    navigation.goBack();
  };

  /** Drop bottom safe-area while keyboard is open — removes white gap under keyboard. */
  useEffect(() => {
    if (!isNative) return undefined;
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const start = () => {
    setListening(true);
    setError('');
    setResult(null);
    setTimeout(() => {
      setTranscript(DEMO_LINE);
      setListening(false);
    }, 700);
  };

  const analyze = async () => {
    const text = transcript.trim();
    if (!text) {
      setError('Type or capture what you ate first.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    Keyboard.dismiss();
    try {
      const parsed = await parseFoodFromText(text);
      setResult(parsed);
    } catch (e) {
      setError(e.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  const logAll = () => {
    if (!result?.items?.length) return;
    result.items.forEach((food) => addFood(meal, food));
    navigation.navigate('Main', { screen: 'Diary' });
  };

  const body = (
    <>
      <SafeAreaTop color={c.pageBg} />
      <ScreenHeader
        title="Voice log"
        onBack={onBack}
        theme={c}
        right={<AiBadge label={keyReady ? 'Nemotron' : 'Add API key'} />}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={isNative ? 'on-drag' : 'none'}
      >
        <Text style={[styles.sub, { color: c.muted }]}>
          Describe what you ate (or use demo voice text). AI uses{' '}
          <Text style={{ color: colors.aiPurple }}>{AI_CONFIG.model.split('/').pop()}</Text> via OpenRouter.
        </Text>

        {!keyReady ? (
          <View style={[styles.warn, { backgroundColor: isDark ? '#2A1A14' : '#FFF4ED', borderColor: colors.carbs }]}>
            <Text style={[styles.warnText, { color: c.text, fontFamily: snPro('600') }]}>
              Add your key in `.env`:
            </Text>
            <Text style={[styles.warnCode, { color: c.muted }]}>EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-...</Text>
            <Text style={[styles.warnText, { color: c.muted, marginTop: 6 }]}>Then restart Expo.</Text>
          </View>
        ) : null}

        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: c.muted, fontFamily: snPro('700'), marginBottom: 0 }]}>
            TRANSCRIPT
          </Text>
          <AppButton
            size="sm"
            label={result ? 'Search again' : 'Search'}
            icon={Search}
            onPress={analyze}
            disabled={!keyReady || loading || !transcript.trim()}
            loading={loading}
            style={{ minWidth: 100 }}
          />
        </View>

        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: c.cardBg,
              borderColor: result ? colors.primary : c.border,
            },
          ]}
        >
          <TextInput
            value={transcript}
            onChangeText={setTranscript}
            multiline
            placeholder="e.g. Two eggs, toast with avocado, black coffee"
            placeholderTextColor={c.muted}
            style={[styles.input, { color: c.text, fontFamily: snPro('400') }]}
          />
          <Pressable
            onPress={analyze}
            disabled={!keyReady || loading || !transcript.trim()}
            hitSlop={6}
            style={[
              styles.inputSearchIcon,
              {
                backgroundColor: c.chip,
                opacity: !keyReady || loading || !transcript.trim() ? 0.5 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Search size={18} color={colors.primary} />
            )}
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {result ? (
          <View style={styles.resultWrap}>
            <AiResultCard result={result} />
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: c.border,
            backgroundColor: c.pageBg,
            // No safe-area gap while keyboard is open
            paddingBottom: keyboardOpen ? 10 : 20,
          },
        ]}
      >
        {!result ? (
          <View style={styles.footerRow}>
            <AppButton
              variant="secondary"
              size="md"
              label={listening ? 'Listening…' : 'Demo voice'}
              icon={Mic}
              onPress={start}
              disabled={listening || loading}
              style={styles.footerBtn}
            />
            <AppButton
              size="md"
              label="Analyze"
              icon={Sparkles}
              onPress={analyze}
              disabled={!keyReady || loading}
              loading={loading}
              style={styles.footerBtnPrimary}
            />
          </View>
        ) : (
          <View style={styles.footerRow}>
            <AppButton
              variant="secondary"
              size="md"
              label="Search again"
              icon={Search}
              onPress={analyze}
              disabled={!keyReady || loading || !transcript.trim()}
              loading={loading}
              style={styles.footerBtn}
            />
            <AppButton
              size="md"
              label={`Log ${result.items.length}`}
              onPress={logAll}
              disabled={loading}
              style={styles.footerBtnPrimary}
            />
          </View>
        )}
      </View>
    </>
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: c.pageBg }]}
      // Keyboard open → no bottom inset (fixes white gap under keyboard)
      edges={keyboardOpen ? [] : ['bottom']}
    >
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          {body}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 16, flexGrow: 1 },
  sub: { fontSize: 14, marginTop: 4, lineHeight: 20, marginBottom: 12 },
  warn: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  warnText: { fontSize: 13 },
  warnCode: { fontSize: 12, marginTop: 4, fontFamily: 'monospace' },
  label: { fontSize: 10, letterSpacing: 1, marginBottom: 8 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputWrap: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 110,
    position: 'relative',
  },
  input: {
    minHeight: 110,
    borderRadius: 16,
    padding: 14,
    paddingRight: 52,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  inputSearchIcon: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { color: colors.danger, marginTop: 10, fontSize: 13 },
  resultWrap: {
    marginTop: 8,
  },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerBtn: { flex: 1, minWidth: 0 },
  footerBtnPrimary: { flex: 1.15, minWidth: 0 },
});
