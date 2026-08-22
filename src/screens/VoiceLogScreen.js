import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, Mic } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useDiary } from '../context/DiaryContext';
import { themeColors, colors } from '../config/colors';
import { FONT } from '../config/fonts';
import AiBadge from '../components/AiBadge';
import { getFoodById } from '../data/foods';

const DEMO_LINE = 'I had 1 cup of Kirkland Greek yogurt, honey, and some grapes.';
const DEMO_IDS = ['f1', 'f2', 'f3'];

export default function VoiceLogScreen({ navigation, route }) {
  const meal = route.params?.meal || 'snacks';
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { addFood } = useDiary();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const start = () => {
    setListening(true);
    setTimeout(() => {
      setTranscript(DEMO_LINE);
      setListening(false);
    }, 900);
  };

  const logAll = () => {
    DEMO_IDS.forEach((id) => {
      const food = getFoodById(id);
      if (food) addFood(meal, food);
    });
    navigation.navigate('Main', { screen: 'Diary' });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.pageBg }]} edges={['top', 'bottom']}>
      <View style={styles.head}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <ChevronLeft size={22} color={c.text} />
        </Pressable>
        <AiBadge label="AI later" />
      </View>

      <Text style={[styles.title, { color: c.text }]}>Voice logging</Text>
      <Text style={[styles.sub, { color: c.muted }]}>
        Say what you ate. Speech-to-food matching will connect to AI later.
      </Text>

      {transcript ? (
        <View style={[styles.bubble, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <Text style={[styles.bubbleText, { color: c.text }]}>{transcript}</Text>
        </View>
      ) : (
        <View style={[styles.placeholder, { borderColor: c.border }]}>
          <Text style={{ color: c.muted, textAlign: 'center' }}>
            {listening ? 'Listening…' : 'Tap the button to simulate a voice log.'}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        {!transcript ? (
          <Pressable style={styles.cta} onPress={start}>
            <Mic size={18} color="#FFFFFF" />
            <Text style={styles.ctaText}>{listening ? 'Listening…' : 'Start voice logging'}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.cta} onPress={logAll}>
            <Text style={styles.ctaText}>Log yogurt, honey & grapes</Text>
          </Pressable>
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
  title: {
    fontSize: 26,
    fontWeight: '400',
    paddingHorizontal: 20,
    marginTop: 12,
    fontFamily: FONT.nova,
  },
  sub: { fontSize: 14, paddingHorizontal: 20, marginTop: 8, lineHeight: 20 },
  bubble: {
    margin: 20,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  bubbleText: { fontSize: 16, lineHeight: 24 },
  placeholder: {
    margin: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  footer: { marginTop: 'auto', padding: 20 },
  cta: {
    height: 52,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
