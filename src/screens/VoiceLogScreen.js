import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ChevronLeft, Mic, Sparkles, Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { themeColors, colors } from '../config/colors';
import { FONT, snPro } from '../config/fonts';
import AiBadge from '../components/AiBadge';
import AiResultCard from '../components/AiResultCard';
import { parseFoodFromText, hasAiKey } from '../services/aiService';
import { AI_CONFIG } from '../config/ai';

const DEMO_LINE = 'I had 1 cup of Greek yogurt, honey, and some grapes.';

export default function VoiceLogScreen({ navigation, route }) {
  const meal = route.params?.meal || 'snacks';
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { addFood } = useDiary();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const keyReady = hasAiKey();

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

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.pageBg }]} edges={['top', 'bottom']}>
      <View style={styles.head}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <AiBadge label={keyReady ? 'Nemotron' : 'Add API key'} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: c.text }]}>Voice logging</Text>
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
          <Pressable
            onPress={analyze}
            disabled={!keyReady || loading || !transcript.trim()}
            style={({ pressed }) => [
              styles.searchBtn,
              {
                backgroundColor: colors.primary,
                opacity: !keyReady || loading || !transcript.trim() ? 0.45 : pressed ? 0.88 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Search size={14} color="#FFFFFF" />
                <Text style={[styles.searchBtnText, { fontFamily: snPro('700') }]}>
                  {result ? 'Search again' : 'Search'}
                </Text>
              </>
            )}
          </Pressable>
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
            style={[
              styles.input,
              {
                color: c.text,
                fontFamily: snPro('400'),
              },
            ]}
          />
          <Pressable
            onPress={analyze}
            disabled={!keyReady || loading || !transcript.trim()}
            hitSlop={6}
            style={[
              styles.inputSearchIcon,
              {
                backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft,
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

      <View style={styles.footer}>
        {!result ? (
          <>
            <Pressable
              style={[styles.secondary, { borderColor: c.border, backgroundColor: c.chip }]}
              onPress={start}
              disabled={listening || loading}
            >
              <Mic size={16} color={c.text} />
              <Text style={[styles.secondaryText, { color: c.text }]}>
                {listening ? 'Listening…' : 'Demo voice text'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.cta, (!keyReady || loading) && styles.ctaDisabled]}
              onPress={analyze}
              disabled={!keyReady || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Sparkles size={16} color="#FFFFFF" />
                  <Text style={styles.ctaText}>Analyze with AI</Text>
                </>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={[styles.secondary, { borderColor: c.border, backgroundColor: c.chip }]}
              onPress={analyze}
              disabled={!keyReady || loading || !transcript.trim()}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Search size={16} color={c.text} />
                  <Text style={[styles.secondaryText, { color: c.text }]}>Search again</Text>
                </>
              )}
            </Pressable>
            <Pressable style={styles.cta} onPress={logAll} disabled={loading}>
              <Text style={styles.ctaText}>
                Log {result.items.length} item{result.items.length === 1 ? '' : 's'} to {meal}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  back: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 16 },
  title: {
    fontSize: 26,
    marginTop: 12,
    fontFamily: FONT.nova,
  },
  sub: { fontSize: 14, marginTop: 8, lineHeight: 20, marginBottom: 12 },
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
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    minWidth: 100,
    justifyContent: 'center',
  },
  searchBtnText: { color: '#FFFFFF', fontSize: 12 },
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
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#0B0B0B',
    padding: 12,
  },
  footer: { padding: 20, gap: 10 },
  secondary: {
    height: 48,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryText: { fontSize: 14, fontWeight: '700' },
  cta: {
    height: 52,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
