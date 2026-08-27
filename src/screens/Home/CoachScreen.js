import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles } from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import AppButton from '../../components/common/AppButton';
import AiBadge from '../../components/common/AiBadge';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { colors, themeColors } from '../../config/colors';
import { snPro } from '../../config/fonts';
import { COACH_SYSTEM_PROMPT } from '../../config/aiPrompts';
import { chatCompletion, hasAiKey } from '../../services/aiService';

const STARTER = {
  role: 'assistant',
  text: 'Hi! I know your goals and what you logged today. Ask about any food, meal ideas, or swaps.',
};

const PROMPTS = ['What should I eat for dinner?', 'High-protein breakfast ideas', 'Is this meal too salty?'];

const isWeb = Platform.OS === 'web';
const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export default function CoachScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const insets = useSafeAreaInsets();
  const { profile, goal, totals } = useDiary();
  const keyReady = hasAiKey();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([STARTER]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!isNative) return undefined;
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, () => {
      setKeyboardOpen(true);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isWeb) {
        inputRef.current?.blur();
        Keyboard.dismiss();
        return undefined;
      }
      const t = setTimeout(() => inputRef.current?.focus(), 400);
      return () => {
        clearTimeout(t);
        inputRef.current?.blur();
        Keyboard.dismiss();
        setKeyboardOpen(false);
      };
    }, []),
  );

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    if (!keyReady) {
      setError('Add EXPO_PUBLIC_OPENROUTER_API_KEY in .env and restart Expo.');
      return;
    }

    const userMsg = { role: 'user', text: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setDraft('');
    setError('');
    setLoading(true);
    Keyboard.dismiss();

    try {
      const context = `User profile: ${profile.name}, goal ${goal}, ${profile.calories} kcal/day, ${profile.protein}g protein target. Today logged: ${totals.calories} kcal, ${totals.protein}g protein.`;
      const apiMessages = [
        { role: 'system', content: `${COACH_SYSTEM_PROMPT}\n\n${context}` },
        ...next.slice(1).map((m) => ({ role: m.role, content: m.text })),
      ];
      const reply = await chatCompletion(apiMessages, { temperature: 0.4, maxTokens: 400 });
      setMessages((prev) => [...prev, { role: 'assistant', text: reply.trim() }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      setError(e.message || 'Coach request failed');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([STARTER]);
    setError('');
    setDraft('');
    if (isNative) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const footer = (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: c.border,
          backgroundColor: c.pageBg,
          // Keyboard open: no safe-area gap under buttons
          paddingBottom: keyboardOpen ? 10 : isNative ? Math.max(insets.bottom, 12) : 16,
        },
      ]}
    >
      <View style={[styles.inputRow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask about any food…"
          placeholderTextColor={c.placeholder}
          style={[styles.input, { color: c.text, fontFamily: snPro('400') }]}
          multiline={!isWeb}
          maxLength={500}
          autoFocus={false}
          showSoftInputOnFocus={isNative}
          blurOnSubmit={false}
          returnKeyType="send"
          onSubmitEditing={() => send(draft)}
        />
      </View>
      <View style={styles.footerBtns}>
        <AppButton variant="secondary" size="md" label="Clear" onPress={clearChat} style={{ flex: 1, minWidth: 0 }} />
        <AppButton
          size="md"
          label="Send"
          icon={Sparkles}
          onPress={() => send(draft)}
          loading={loading}
          disabled={!draft.trim()}
          style={{ flex: 1.2, minWidth: 0 }}
        />
      </View>
    </View>
  );

  const chat = (
    <View style={styles.flex}>
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={isNative ? 'interactive' : 'none'}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <Text style={[styles.sub, { color: c.muted }]}>
          Knows your goals, allergies & fridge — powered by OpenRouter.
        </Text>

        {messages.map((m, i) => (
          <View
            key={`${m.role}-${i}`}
            style={[
              styles.bubble,
              m.role === 'user' ? styles.bubbleUser : styles.bubbleBot,
              {
                backgroundColor: m.role === 'user' ? colors.primary : c.cardBg,
                borderColor: m.role === 'user' ? colors.primary : c.border,
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              },
            ]}
          >
            <Text style={[styles.bubbleText, { color: m.role === 'user' ? '#FFFFFF' : c.text, fontFamily: snPro('500') }]}>
              {m.text}
            </Text>
          </View>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.promptRow}>
          {PROMPTS.map((p) => (
            <AppButton
              key={p}
              variant="secondary"
              size="sm"
              label={p}
              onPress={() => send(p)}
              disabled={loading}
              style={{ marginTop: 0, flexShrink: 1 }}
              textStyle={{ fontSize: 11 }}
            />
          ))}
        </View>
      </ScrollView>
      {footer}
    </View>
  );

  return (
    <ScreenShell>
      <ScreenHeader
        title="Nutrition coach"
        onBack={() => navigation.goBack()}
        theme={c}
        right={<AiBadge label={keyReady ? 'Nemotron' : 'Add API key'} />}
      />
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={insets.top + 8}>
          {chat}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>{chat}</View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  sub: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  bubble: {
    maxWidth: '88%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleBot: { borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  error: { color: colors.danger, fontSize: 13, marginBottom: 8 },
  promptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, gap: 10 },
  inputRow: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
  },
  input: { fontSize: 15, maxHeight: 80, ...(isWeb ? { outlineStyle: 'none' } : null) },
  footerBtns: { flexDirection: 'row', gap: 10, alignItems: 'center' },
});
