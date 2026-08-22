import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  ScanLine,
  Mic,
  Target,
  TrendingDown,
  Scale,
  Dumbbell,
  Check,
  ChevronRight,
} from 'lucide-react-native';
import { colors } from '../config/colors';
import { FONT } from '../config/fonts';
import { useDiary } from '../context/DiaryContext';

const GOALS = [
  {
    id: 'lose',
    title: 'Lose weight',
    sub: 'Steady deficit with balanced macros',
    Icon: TrendingDown,
  },
  {
    id: 'maintain',
    title: 'Maintain',
    sub: 'Stay consistent with daily logging',
    Icon: Scale,
  },
  {
    id: 'gain',
    title: 'Gain muscle',
    sub: 'Higher protein, strength-focused',
    Icon: Dumbbell,
  },
];

const FEATURES = [
  {
    Icon: Target,
    title: 'Personalized dashboard',
    text: 'Calories left, macros, and water — one glance.',
    tint: colors.primarySoft,
    iconColor: colors.primary,
  },
  {
    Icon: ScanLine,
    title: 'Scan your food',
    text: 'Camera UI ready for meal recognition.',
    tint: '#FFF4E5',
    iconColor: '#E68A00',
    ai: true,
  },
  {
    Icon: Mic,
    title: 'Voice logging',
    text: 'Speak a meal. AI parsing comes later.',
    tint: '#F0EDFF',
    iconColor: colors.aiPurple,
    ai: true,
  },
];

export default function OnboardingScreen({ onDone }) {
  const { setGoal } = useDiary();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState('lose');
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(18);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [step, fade, slide]);

  const next = () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    setGoal(picked);
    onDone();
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#E8F3FF', '#F7FAFD', '#FFFFFF']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.blobA} />
      <View style={styles.blobB} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.logo}>
              <Sparkles size={20} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.brand}>Healthline</Text>
          </View>
          <View style={styles.dots}>
            <View style={[styles.dot, step === 0 && styles.dotOn]} />
            <View style={[styles.dot, step === 1 && styles.dotOn]} />
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
            {step === 0 ? <WelcomeStep /> : (
              <GoalStep picked={picked} setPicked={setPicked} />
            )}
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={next}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGrad}
            >
              <Text style={styles.ctaText}>{step === 0 ? 'Continue' : 'Start tracking'}</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
          {step === 1 ? (
            <Pressable onPress={() => setStep(0)} style={styles.backLink}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          ) : (
            <Text style={styles.footNote}>UI demo · AI features coming next</Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function WelcomeStep() {
  return (
    <View>
      <Text style={styles.kicker}>NUTRITION TRACKER</Text>
      <Text style={styles.h1}>
        Eat better.{'\n'}
        <Text style={styles.h1Accent}>Track smarter.</Text>
      </Text>
      <Text style={styles.sub}>
        Log meals, hit macros, and browse recipes — with scan & voice UI ready for AI.
      </Text>

      <View style={styles.preview}>
        <LinearGradient colors={['#FFFFFF', '#F3F8FF']} style={styles.previewInner}>
          <View style={styles.previewTop}>
            <Text style={styles.previewLbl}>Today</Text>
            <View style={styles.aiPill}>
              <Sparkles size={10} color="#FFFFFF" />
              <Text style={styles.aiPillText}>Now with AI</Text>
            </View>
          </View>
          <View style={styles.ringMock}>
            <View style={styles.ringOuter}>
              <View style={styles.ringInner}>
                <Text style={styles.ringNum}>1,390</Text>
                <Text style={styles.ringCap}>cals left</Text>
              </View>
            </View>
            <View style={styles.miniBars}>
              <MiniBar color={colors.carbs} w="72%" />
              <MiniBar color={colors.protein} w="48%" />
              <MiniBar color={colors.fat} w="35%" />
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <Feature key={f.title} {...f} />
        ))}
      </View>
    </View>
  );
}

function GoalStep({ picked, setPicked }) {
  return (
    <View>
      <Text style={styles.kicker}>YOUR GOAL</Text>
      <Text style={styles.h1}>What are you{'\n'}working toward?</Text>
      <Text style={styles.sub}>You can change this anytime in More.</Text>

      <View style={styles.goalList}>
        {GOALS.map((g) => {
          const active = picked === g.id;
          const Icon = g.Icon;
          return (
            <Pressable
              key={g.id}
              onPress={() => setPicked(g.id)}
              style={[styles.goal, active && styles.goalOn]}
            >
              <View style={[styles.goalIcon, active && styles.goalIconOn]}>
                <Icon size={18} color={active ? '#FFFFFF' : colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.goalTitle, active && { color: colors.primary }]}>{g.title}</Text>
                <Text style={styles.goalSub}>{g.sub}</Text>
              </View>
              <View style={[styles.check, active && styles.checkOn]}>
                {active ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Feature({ Icon, title, text, tint, iconColor, ai }) {
  return (
    <View style={styles.feat}>
      <View style={[styles.featIcon, { backgroundColor: tint }]}>
        <Icon size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.featTitleRow}>
          <Text style={styles.featTitle}>{title}</Text>
          {ai ? (
            <View style={styles.miniAi}>
              <Text style={styles.miniAiText}>AI</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.featText}>{text}</Text>
      </View>
    </View>
  );
}

function MiniBar({ color, w }) {
  return (
    <View style={styles.miniTrack}>
      <View style={[styles.miniFill, { backgroundColor: color, width: w }]} />
    </View>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: '#0070E0',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 4 },
  default: {
    shadowColor: '#0070E0',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  safe: { flex: 1 },
  blobA: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(0,112,224,0.10)',
  },
  blobB: {
    position: 'absolute',
    top: 180,
    left: -90,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0,182,122,0.08)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    fontFamily: FONT.nova,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 99, backgroundColor: '#D0D7E2' },
  dotOn: { width: 20, backgroundColor: colors.primary },
  scroll: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 16 },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.primary,
    marginBottom: 10,
  },
  h1: {
    fontSize: 32,
    fontWeight: '400',
    color: '#0F172A',
    lineHeight: 38,
    letterSpacing: -0.6,
    fontFamily: FONT.nova,
  },
  h1Accent: { color: colors.primary, fontFamily: FONT.nova },
  sub: { marginTop: 12, fontSize: 15, lineHeight: 23, color: '#64748B' },
  preview: {
    marginTop: 22,
    borderRadius: 22,
    ...shadow,
  },
  previewInner: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0,112,224,0.12)',
    padding: 16,
    overflow: 'hidden',
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  previewLbl: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.aiPurple,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
  },
  aiPillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  ringMock: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  ringOuter: {
    width: 108,
    height: 108,
    borderRadius: 99,
    borderWidth: 10,
    borderColor: colors.primarySoft,
    borderTopColor: colors.primary,
    borderRightColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: { alignItems: 'center' },
  ringNum: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  ringCap: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 2 },
  miniBars: { flex: 1, gap: 10 },
  miniTrack: {
    height: 8,
    borderRadius: 99,
    backgroundColor: '#EEF2F7',
    overflow: 'hidden',
  },
  miniFill: { height: 8, borderRadius: 99 },
  features: { marginTop: 22, gap: 10 },
  feat: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
    padding: 12,
  },
  featIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  featText: { fontSize: 13, color: '#64748B', marginTop: 2, lineHeight: 18 },
  miniAi: {
    backgroundColor: colors.aiSoft,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  miniAiText: { fontSize: 9, fontWeight: '800', color: colors.aiPurple },
  goalList: { marginTop: 22, gap: 10 },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#E6E8EC',
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  goalOn: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  goalIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIconOn: { backgroundColor: colors.primary },
  goalTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  goalSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: '#D0D7E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  footer: { paddingHorizontal: 22, paddingBottom: 10, paddingTop: 6 },
  cta: { borderRadius: 99, overflow: 'hidden' },
  ctaGrad: {
    height: 54,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  backLink: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  backText: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  footNote: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 12,
    fontWeight: '500',
  },
});
