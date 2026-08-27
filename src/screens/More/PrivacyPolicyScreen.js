import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { Shield, Lock, Smartphone, Camera, Database, Trash2 } from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { APP_FULL_NAME } from '../../config/brandContent';
import { themeColors, colors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';

const SECTIONS = [
  {
    icon: Smartphone,
    title: 'Local-first by design',
    body:
      'Your diary, profile, favorites, and settings are stored on this device using local storage. We do not operate a cloud account or sync server in this preview build.',
  },
  {
    icon: Database,
    title: 'What we store on your device',
    body:
      'Meal logs, water and exercise entries, weight history, nutrition goals, theme preferences, and sign-in credentials (hashed locally for demo auth). Nothing is sold or shared with advertisers.',
  },
  {
    icon: Camera,
    title: 'Camera & photos',
    body:
      'Camera access is used only when you scan meals, barcodes, or upload a barcode photo. Images are processed on-device or sent to AI/barcode services only when you explicitly use those features.',
  },
  {
    icon: Lock,
    title: 'Third-party lookups (optional)',
    body:
      'Barcode scans may query Open Food Facts for public product nutrition. AI meal scan and coach features only run if you add an API key in your environment — those requests go directly from your device to the provider.',
  },
  {
    icon: Trash2,
    title: 'Your control',
    body:
      'You can edit or delete logged foods anytime. Use More → Testing → Reset profile to wipe demo data, or uninstall the app to remove all local information.',
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);

  return (
    <ScreenShell>
      <ScreenHeader title="Privacy policy" onBack={() => navigation.goBack()} theme={c} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: isDark ? '#1A2744' : colors.primarySoft, borderColor: c.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <Shield size={22} color={colors.primary} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: c.text, fontFamily: snPro('700') }]}>
              Your data stays yours
            </Text>
            <Text style={[styles.heroSub, { color: c.muted, fontFamily: snPro('400') }]}>
              {APP_FULL_NAME} — last updated August 2026
            </Text>
          </View>
        </View>

        <Text style={[styles.intro, { color: c.text, fontFamily: snPro('400') }]}>
          This policy describes how {APP_FULL_NAME} handles information in the current UI preview.
          It is written in plain language so you know exactly what happens on your phone or browser.
        </Text>

        {SECTIONS.map((section) => (
          <PolicyBlock key={section.title} section={section} theme={c} isDark={isDark} />
        ))}

        <Text style={[styles.footer, { color: c.muted, fontFamily: snPro('400') }]}>
          Questions? This is a local demo template — for a production app, replace this page with your
          legal team&apos;s full privacy policy and a contact email.
        </Text>
      </ScrollView>
    </ScreenShell>
  );
}

function PolicyBlock({ section, theme, isDark }) {
  const Icon = section.icon;
  return (
    <View style={[styles.block, cardShadow, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <View style={styles.blockHead}>
        <View style={[styles.blockIcon, { backgroundColor: isDark ? '#1C1C1E' : `${colors.primary}14` }]}>
          <Icon size={18} color={colors.primary} strokeWidth={2.2} />
        </View>
        <Text style={[styles.blockTitle, { color: theme.text, fontFamily: snPro('700') }]}>{section.title}</Text>
      </View>
      <Text style={[styles.blockBody, { color: theme.muted, fontFamily: snPro('400') }]}>{section.body}</Text>
    </View>
  );
}

const cardShadow = Platform.select({
  ios: { shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  android: { elevation: 1 },
  default: {},
});

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 16 },
  heroSub: { fontSize: 12, marginTop: 4, lineHeight: 17 },
  intro: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
  block: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  blockIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockTitle: { fontSize: 15, flex: 1 },
  blockBody: { fontSize: 13, lineHeight: 20 },
  footer: { fontSize: 12, lineHeight: 18, marginTop: 8 },
});
