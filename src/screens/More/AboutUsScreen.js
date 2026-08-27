import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, Linking, Pressable } from 'react-native';
import {
  Info,
  Sparkles,
  ScanLine,
  Barcode,
  ChartLine,
  MessageCircle,
  ExternalLink,
  Zap,
} from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import BrandLogo from '../../components/common/BrandLogo';
import { useTheme } from '../../context/ThemeContext';
import { getBrandContent, APP_FULL_NAME } from '../../config/brandContent';
import { themeColors, colors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';

const APP_VERSION = '1.0.0';

const FEATURES = [
  { icon: ScanLine, label: 'AI meal scan & voice log' },
  { icon: Barcode, label: 'Barcode food lookup' },
  { icon: ChartLine, label: 'Progress & macro tracking' },
  { icon: MessageCircle, label: 'AI nutrition coach' },
];

export default function AboutUsScreen({ navigation }) {
  const { isDark, brand } = useTheme();
  const c = themeColors(isDark);
  const content = getBrandContent(brand);

  return (
    <ScreenShell>
      <ScreenHeader title="About us" onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.brandCard, cardShadow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <BrandLogo size={56} showName />
          <Text style={[styles.tagline, { color: c.muted, fontFamily: snPro('500') }]}>{content.tagline}</Text>
          <View style={[styles.versionPill, { backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft }]}>
            <Zap size={14} color={colors.primary} />
            <Text style={[styles.versionText, { color: colors.primary, fontFamily: snPro('700') }]}>
              Version {APP_VERSION} · UI preview build
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: c.text, fontFamily: FONT.nova }]}>Our mission</Text>
        <Text style={[styles.body, { color: c.muted, fontFamily: snPro('400') }]}>
          {APP_FULL_NAME} helps you eat smarter without spreadsheets. Track meals, scan barcodes,
          monitor macros, and get AI-powered coaching — all in a clean, premium mobile experience inspired
          by leading nutrition apps.
        </Text>

        <Text style={[styles.sectionTitle, { color: c.text, fontFamily: FONT.nova }]}>What&apos;s included</Text>
        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <View key={f.label} style={[styles.featureRow, { backgroundColor: c.cardBg, borderColor: c.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: isDark ? '#1C1C1E' : `${colors.primary}12` }]}>
                <f.icon size={18} color={colors.primary} strokeWidth={2.2} />
              </View>
              <Text style={[styles.featureLbl, { color: c.text, fontFamily: snPro('600') }]}>{f.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1A2744' : colors.primarySoft, borderColor: c.border }]}>
          <Info size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: c.text, fontFamily: snPro('500') }]}>
            Built with Expo 54 · React Native · local diary state. Barcode data from Open Food Facts.
            AI features use OpenRouter when configured.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: c.text, fontFamily: FONT.nova }]}>Credits</Text>
        <Text style={[styles.body, { color: c.muted, fontFamily: snPro('400') }]}>
          UI inspired by MyFitnessPal-style nutrition tracking and Healthline&apos;s nutrition app roundup.
          Fonts: SN Pro & Nova Round via Expo Google Fonts. Icons by Lucide.
        </Text>

        <Pressable
          onPress={() => Linking.openURL('https://www.healthline.com/nutrition/top-iphone-android-apps')}
          style={[styles.linkRow, { borderColor: c.border }]}
        >
          <Sparkles size={16} color={colors.primary} />
          <Text style={[styles.linkText, { color: colors.primary, fontFamily: snPro('600') }]}>
            Healthline nutrition app guide
          </Text>
          <ExternalLink size={14} color={colors.primary} />
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

const cardShadow = Platform.select({
  ios: { shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  android: { elevation: 2 },
  default: {},
});

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  brandCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  tagline: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  versionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
  },
  versionText: { fontSize: 12 },
  sectionTitle: { fontSize: 20, marginBottom: 10, letterSpacing: -0.3 },
  body: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  featureList: { gap: 8, marginBottom: 20 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLbl: { fontSize: 14, flex: 1 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 19 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderTopWidth: 1,
    marginTop: 4,
  },
  linkText: { flex: 1, fontSize: 14 },
});
