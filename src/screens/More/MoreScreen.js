import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  Pressable,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Target,
  Moon,
  Sparkles,
  Info,
  ChevronRight,
  Scale,
  Droplets,
  Flame,
  ScanLine,
  Mic,
  Compass,
  Bell,
  Shield,
  Crown,
  Heart,
  Dumbbell,
  Barcode,
  ChartLine,
  User,
  CalendarDays,
  ShoppingBag,
  MessageCircle,
  HeartPulse,
  GraduationCap,
  RotateCcw,
  LogOut,
} from 'lucide-react-native';
import ScreenShell from '../../components/common/ScreenShell';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARD_KEY } from '../../config/storageKeys';

const GOAL_LABEL = { lose: 'Lose weight', maintain: 'Maintain', gain: 'Gain muscle' };

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 2 },
  default: {},
});

export default function MoreScreen({ navigation }) {
  const { isDark, toggleTheme } = useTheme();
  const c = themeColors(isDark);
  const { profile, goal, water, totals, resetForTesting } = useDiary();
  const { user, signOut, clearAuthForTesting } = useAuth();
  const { confirm } = useConfirm();

  const goTab = (tab) => navigation.navigate(tab);
  const goStack = (screen, params) => navigation.navigate(screen, params);

  const rootNav = () =>
    navigation.getParent()?.getParent?.() || navigation.getParent?.() || navigation;

  const logOut = async () => {
    const ok = await confirm({
      title: 'Sign out?',
      message: 'You can sign back in anytime with the same email on this device.',
      confirmLabel: 'Sign out',
      cancelLabel: 'Cancel',
      destructive: false,
    });
    if (!ok) return;
    await signOut();
    rootNav().reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  };

  const resetToGetStarted = async () => {
    const ok = await confirm({
      title: 'Reset for testing?',
      message:
        'Clears local diary data, signs you out, and shows the Get started screen again. For testing only.',
      confirmLabel: 'Reset',
      cancelLabel: 'Cancel',
    });
    if (!ok) return;

    try {
      await AsyncStorage.removeItem(ONBOARD_KEY);
    } catch {
      // continue even if storage fails
    }
    resetForTesting();
    await clearAuthForTesting();
    rootNav().reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  };

  return (
    <ScreenShell>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.kicker, { color: colors.primary, fontFamily: snPro('800') }]}>SETTINGS</Text>
        <Text style={[styles.title, { color: c.text }]}>More</Text>
        <Text style={[styles.sub, { color: c.muted }]}>
          Profile, goals, theme, and app info. All local UI — no account API yet.
        </Text>

        <Pressable
          onPress={() => goStack('ProfileEdit')}
          style={[styles.profileCard, cardShadow, { borderColor: isDark ? c.border : 'rgba(0,112,224,0.14)' }]}
        >
          <LinearGradient
            colors={isDark ? ['#161616', '#121212'] : ['#FFFFFF', '#F0F7FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileInner}
          >
            <View style={styles.profileTop}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { fontFamily: snPro('800') }]}>{profile.name.slice(0, 1)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: c.text, fontFamily: snPro('800') }]}>{profile.name}</Text>
                <Text style={[styles.meta, { color: c.muted, fontFamily: snPro('500') }]}>
                  {GOAL_LABEL[goal]} · {profile.calories} kcal goal
                </Text>
                <Text style={[styles.editHint, { color: colors.primary, fontFamily: snPro('600') }]}>Tap to edit profile</Text>
              </View>
              <View style={[styles.streakBadge, { backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft }]}>
                <Flame size={14} color={colors.carbs} />
                <Text style={[styles.streakText, { color: colors.carbs, fontFamily: snPro('700') }]}>6d</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <MiniStat icon={Scale} label="Weight" value={`${profile.weight} kg`} theme={c} isDark={isDark} />
              <MiniStat icon={Target} label="Target" value={`${profile.goalWeight} kg`} theme={c} isDark={isDark} accent={colors.accent} />
              <MiniStat icon={Droplets} label="Water" value={`${water}/${profile.waterGoal}`} theme={c} isDark={isDark} accent={colors.primary} />
            </View>
          </LinearGradient>
        </Pressable>

        <View style={[styles.premiumCard, { backgroundColor: isDark ? '#1A2744' : colors.primarySoft, borderColor: isDark ? '#2A3A5C' : 'rgba(0,112,224,0.18)' }]}>
          <View style={[styles.premiumIcon, { backgroundColor: isDark ? '#243B66' : '#FFFFFF' }]}>
            <Crown size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.premiumTitle, { color: c.text, fontFamily: snPro('700') }]}>Healthline Plus</Text>
            <Text style={[styles.premiumSub, { color: c.muted }]}>Advanced insights & meal plans — coming soon</Text>
          </View>
          <ChevronRight size={18} color={colors.primary} />
        </View>

        <SectionLabel label="Plan & coach" theme={c} />
        <View style={styles.linkGrid}>
          <QuickLink icon={CalendarDays} label="Meal plan" color={colors.primary} theme={c} isDark={isDark} onPress={() => goStack('MealPlan')} />
          <QuickLink icon={ShoppingBag} label="Grocery" color={colors.accent} theme={c} isDark={isDark} onPress={() => goStack('GroceryList')} />
          <QuickLink icon={MessageCircle} label="AI coach" color={colors.aiPurple} theme={c} isDark={isDark} onPress={() => goStack('Coach')} />
          <QuickLink icon={GraduationCap} label="Programs" color={colors.exercise} theme={c} isDark={isDark} onPress={() => goStack('Programs')} />
        </View>

        <SectionLabel label="Quick links" theme={c} />
        <View style={styles.linkGrid}>
          <QuickLink icon={Compass} label="Recipes" color={colors.primary} theme={c} isDark={isDark} onPress={() => goTab('Discover')} />
          <QuickLink icon={Heart} label="Favorites" color={colors.danger} theme={c} isDark={isDark} onPress={() => goStack('Favorites')} />
          <QuickLink icon={Barcode} label="Barcode" color={colors.primary} theme={c} isDark={isDark} onPress={() => goStack('BarcodeScan', { meal: 'snacks' })} />
          <QuickLink icon={ChartLine} label="Report" color={colors.exercise} theme={c} isDark={isDark} onPress={() => goStack('WeeklyReport')} />
        </View>

        <SectionLabel label="Goals & health" theme={c} />
        <SettingsRow
          icon={HeartPulse}
          iconBg={`${colors.aiPurple}22`}
          iconColor={colors.aiPurple}
          title="Health tracks"
          subtitle="PCOS, thyroid, blood sugar, blood pressure"
          theme={c}
          isDark={isDark}
          onPress={() => goStack('HealthTracks')}
        />
        <SettingsRow
          icon={User}
          iconBg={colors.primarySoft}
          title="Edit profile"
          subtitle={`${profile.name} · ${GOAL_LABEL[goal]}`}
          theme={c}
          isDark={isDark}
          onPress={() => goStack('ProfileEdit')}
        />
        <SettingsRow
          icon={Target}
          iconBg={colors.primarySoft}
          title="Nutrition goals"
          subtitle={`${profile.protein}g protein · ${profile.carbs}g carbs · ${profile.fat}g fat`}
          theme={c}
          isDark={isDark}
          onPress={() => goStack('EditGoals')}
        />
        <SettingsRow
          icon={Scale}
          iconBg={`${colors.accent}22`}
          iconColor={colors.accent}
          title="Log weight"
          subtitle={`Current ${profile.weight} kg · goal ${profile.goalWeight} kg`}
          theme={c}
          isDark={isDark}
          onPress={() => goStack('LogWeight')}
        />
        <SettingsRow
          icon={Dumbbell}
          iconBg={`${colors.exercise}22`}
          iconColor={colors.exercise}
          title="Log exercise"
          subtitle="Walk, run, strength & more"
          theme={c}
          isDark={isDark}
          onPress={() => goStack('LogExercise')}
        />
        <SettingsRow
          icon={Flame}
          iconBg={`${colors.carbs}22`}
          iconColor={colors.carbs}
          title="Today's intake"
          subtitle={`${totals.calories} kcal logged · ${Math.max(0, profile.calories - totals.calories)} left`}
          theme={c}
          isDark={isDark}
          onPress={() => goTab('Diary')}
        />
        <SettingsRow
          icon={ChartLine}
          iconBg={colors.primarySoft}
          title="Weekly report"
          subtitle="7-day calories, weight & activity"
          theme={c}
          isDark={isDark}
          onPress={() => goStack('WeeklyReport')}
        />

        <SectionLabel label="Preferences" theme={c} />
        <SettingsRow
          icon={Moon}
          iconBg={isDark ? '#1C1C1E' : colors.primarySoft}
          title="Dark mode"
          subtitle={isDark ? 'On — dark theme active' : 'Off — light theme active'}
          theme={c}
          isDark={isDark}
          onPress={toggleTheme}
          right={<ThemeSwitch value={isDark} isDark={isDark} />}
        />
        <SettingsRow
          icon={Bell}
          iconBg={`${colors.protein}22`}
          iconColor={colors.protein}
          title="Reminders"
          subtitle="Meal & water nudges"
          theme={c}
          isDark={isDark}
          onPress={() => goStack('Reminders')}
        />
        <SettingsRow
          icon={Sparkles}
          iconBg={`${colors.aiPurple}22`}
          iconColor={colors.aiPurple}
          title="AI meal scan"
          subtitle="Camera AI placeholder"
          theme={c}
          isDark={isDark}
          onPress={() => goStack('ScanFood', { meal: 'lunch' })}
        />
        <SettingsRow
          icon={Mic}
          iconBg={`${colors.aiPurple}22`}
          iconColor={colors.aiPurple}
          title="Voice log"
          subtitle="Speak a meal — UI ready"
          theme={c}
          isDark={isDark}
          onPress={() => goStack('VoiceLog', { meal: 'snacks' })}
        />
        <SettingsRow
          icon={ScanLine}
          iconBg={colors.primarySoft}
          title="Scan meal"
          subtitle="Same as AI scan entry"
          theme={c}
          isDark={isDark}
          onPress={() => goStack('ScanFood', { meal: 'lunch' })}
        />

        <SectionLabel label="Account" theme={c} />
        <SettingsRow
          icon={User}
          iconBg={colors.primarySoft}
          title={user?.email || 'Signed in'}
          subtitle={[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Local demo account'}
          theme={c}
          isDark={isDark}
          onPress={() => goStack('ProfileEdit')}
        />
        <SettingsRow
          icon={LogOut}
          iconBg={isDark ? '#1C1C1E' : c.chip}
          iconColor={colors.danger}
          title="Sign out"
          subtitle="Return to welcome screen"
          theme={c}
          isDark={isDark}
          onPress={logOut}
        />

        <SectionLabel label="About" theme={c} />
        <SettingsRow
          icon={Shield}
          iconBg={isDark ? '#1C1C1E' : c.chip}
          title="Privacy"
          subtitle="Local data only on this device"
          theme={c}
          isDark={isDark}
        />
        <SettingsRow
          icon={Info}
          iconBg={isDark ? '#1C1C1E' : c.chip}
          title="About"
          subtitle="Healthline Nutrition · Expo 54 UI template"
          theme={c}
          isDark={isDark}
        />

        <SectionLabel label="Testing" theme={c} />
        <SettingsRow
          icon={RotateCcw}
          iconBg={`${colors.danger}18`}
          iconColor={colors.danger}
          title="Reset profile (testing)"
          subtitle="Fresh start → Get started onboarding"
          theme={c}
          isDark={isDark}
          onPress={resetToGetStarted}
        />

        <Text style={[styles.footer, { color: c.muted, fontFamily: snPro('500') }]}>
          Version 1.0.0 · UI preview build
        </Text>
      </ScrollView>
    </ScreenShell>
  );
}

function SectionLabel({ label, theme }) {
  return (
    <Text style={[styles.section, { color: theme.muted, fontFamily: snPro('800') }]}>{label.toUpperCase()}</Text>
  );
}

function MiniStat({ icon: Icon, label, value, theme, isDark, accent }) {
  const tint = accent || colors.primary;
  return (
    <View style={[styles.miniStat, { backgroundColor: isDark ? '#1C1C1E' : 'rgba(255,255,255,0.72)', borderColor: theme.border }]}>
      <Icon size={14} color={tint} />
      <Text style={[styles.miniLbl, { color: theme.muted, fontFamily: snPro('600') }]}>{label}</Text>
      <Text style={[styles.miniVal, { color: theme.text, fontFamily: snPro('800') }]}>{value}</Text>
    </View>
  );
}

function QuickLink({ icon: Icon, label, color, theme, isDark, onPress }) {
  return (
    <View style={styles.quickWrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.quickLink,
          cardShadow,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
            opacity: pressed ? 0.88 : 1,
          },
        ]}
      >
        <View style={[styles.quickIcon, { backgroundColor: isDark ? '#1C1C1E' : `${color}18` }]}>
          <Icon size={18} color={color} />
        </View>
        <Text style={[styles.quickLbl, { color: theme.text, fontFamily: snPro('600') }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

function ThemeSwitch({ value, isDark }) {
  return (
    <Switch
      value={value}
      pointerEvents="none"
      trackColor={{ false: isDark ? '#3A3A3C' : '#D1D5DB', true: colors.primary }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={isDark ? '#3A3A3C' : '#D1D5DB'}
    />
  );
}

function SettingsRow({ icon: Icon, iconBg, iconColor, title, subtitle, theme, isDark, right, onPress }) {
  const content = (
    <>
      <View style={[styles.iconWrap, { backgroundColor: isDark ? '#1C1C1E' : iconBg || colors.primarySoft }]}>
        <Icon size={18} color={iconColor || colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, { color: theme.text, fontFamily: snPro('700') }]}>{title}</Text>
        <Text style={[styles.rowSub, { color: theme.muted, fontFamily: snPro('400') }]}>{subtitle}</Text>
      </View>
      {right || (onPress ? <ChevronRight size={18} color={theme.muted} /> : null)}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          cardShadow,
          { backgroundColor: theme.cardBg, borderColor: theme.border, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.row, cardShadow, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 36 },
  kicker: { fontSize: 11, letterSpacing: 1 },
  title: { fontSize: 28, marginTop: 4, fontFamily: FONT.nova },
  sub: { fontSize: 14, marginTop: 6, marginBottom: 16, lineHeight: 20 },
  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },
  profileInner: { padding: 16 },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFFFFF', fontSize: 22 },
  name: { fontSize: 18 },
  meta: { fontSize: 13, marginTop: 3 },
  editHint: { fontSize: 12, marginTop: 4 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 99,
  },
  streakText: { fontSize: 12, marginLeft: 4 },
  statRow: { flexDirection: 'row' },
  miniStat: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  miniLbl: { fontSize: 9, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4 },
  miniVal: { fontSize: 13, marginTop: 2 },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 18,
  },
  premiumIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTitle: { fontSize: 15 },
  premiumSub: { fontSize: 12, marginTop: 2 },
  section: {
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  linkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 12,
  },
  quickWrap: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  quickLink: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLbl: { fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowBody: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 15 },
  rowSub: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
