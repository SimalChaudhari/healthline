import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ScrollView,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { useAuth } from '../../context/AuthContext';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import { SafeAreaTop } from '../../components/common/ScreenShell';
import { useSafeTop } from '../../utils/safeArea';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  validateName,
  validateAge,
  validateHeightCm,
  validateWeightKg,
} from '../../utils/validation';

const START_BULLETS = [
  'Photo logging in about two seconds',
  'A coach that knows your fridge and your allergies',
  'Plans that adjust when the day goes sideways',
];

const FOCUS_GOALS = [
  { id: 'lose', label: 'Lose weight steadily', sub: '0.5 kg a week, no crash targets' },
  { id: 'protein', label: 'Build muscle', sub: 'Higher protein floor, timed around training' },
  { id: 'sugar', label: 'Manage blood sugar', sub: 'Flags spikes, suggests swaps' },
  { id: 'family', label: 'Feed my family well', sub: 'Plans and lists scale to 4' },
  { id: 'energy', label: 'Just eat better', sub: 'Fibre, veg and whole foods first' },
];

const ACTIVITY = ['Low', 'Light', 'Moderate', 'High'];

const SEX_OPTS = [
  { id: 'Female', label: 'Female' },
  { id: 'Male', label: 'Male' },
  { id: 'Prefer not to say', label: 'Prefer not to say' },
];

const DIET_OPTS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Mediterranean',
  'Low-carb',
  'High-protein',
  'Halal',
  'Kosher',
  'No preference',
];

const ALLERGENS = ['Fish', 'Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Tree nuts'];

const CONDITIONS = ['Pre-diabetic', 'Hypertension', 'IBS', 'High cholesterol', 'None'];

const NOTIF_OPTS = [
  { id: 'brief', label: 'Morning brief', sub: "Your day's targets and plan at 07:00" },
  { id: 'gap', label: 'Smart gap nudges', sub: 'Only when a macro is at risk — max 1 a day' },
  { id: 'water', label: 'Hydration reminders', sub: "Every 3 hours while you're active" },
  { id: 'weekly', label: 'Weekly review', sub: "Sunday recap and next week's plan" },
];

function focusToDiaryGoal(selected) {
  if (selected.lose) return 'lose';
  if (selected.protein) return 'gain';
  return 'maintain';
}

function suggestCalories({ weight, activity }) {
  const w = Number(weight) || 70;
  const mult = { Low: 26, Light: 28, Moderate: 30, High: 33 }[activity] || 30;
  return Math.round((w * mult) / 10) * 10;
}

function macrosFromCalories(cals, diaryGoal) {
  let pPct = 0.3;
  let cPct = 0.4;
  let fPct = 0.3;
  if (diaryGoal === 'gain') {
    pPct = 0.35;
    cPct = 0.4;
    fPct = 0.25;
  } else if (diaryGoal === 'lose') {
    pPct = 0.35;
    cPct = 0.35;
    fPct = 0.3;
  }
  return {
    protein: Math.round((cals * pPct) / 4),
    carbs: Math.round((cals * cPct) / 4),
    fat: Math.round((cals * fPct) / 9),
  };
}

function softPrimary(isDark) {
  return isDark ? 'rgba(0,112,224,0.18)' : colors.primarySoft;
}

export default function OnboardingScreen({ onDone, navigation, initialStep = 0 }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { setGoal, updateProfile, updateReminder } = useDiary();
  const { isSignedIn } = useAuth();
  const [step, setStep] = useState(initialStep);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;
  const topPad = useSafeTop();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'web' ? 16 : 10);

  const [focus, setFocus] = useState({ lose: true, protein: true, sugar: false, family: true, energy: false });
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState('Female');
  const [age, setAge] = useState('34');
  const [height, setHeight] = useState('168');
  const [weight, setWeight] = useState('74.5');
  const [goalWeight, setGoalWeight] = useState('68.0');
  const [activity, setActivity] = useState('Moderate');
  const [diet, setDiet] = useState({ 'High-protein': true });
  const [allergies, setAllergies] = useState({ Fish: true });
  const [conditions, setConditions] = useState({ 'Pre-diabetic': true });
  const [notifs, setNotifs] = useState({ brief: true, gap: true, water: false, weekly: true });
  const [bodyErrors, setBodyErrors] = useState({});
  const [bodyTouched, setBodyTouched] = useState({});

  const suggestedCals = useMemo(
    () => suggestCalories({ weight, activity }),
    [weight, activity],
  );
  const diaryGoal = useMemo(() => focusToDiaryGoal(focus), [focus]);
  const suggestedMacros = useMemo(
    () => macrosFromCalories(suggestedCals, diaryGoal),
    [suggestedCals, diaryGoal],
  );

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(18);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, [step, fade, slide]);

  const toggleMap = (setter, key) => {
    setter((prev) => {
      if (key === 'None' || key === 'No preference') {
        return { [key]: !prev[key] };
      }
      return { ...prev, [key]: !prev[key], None: false, 'No preference': false };
    });
  };

  const finish = () => {
    const displayName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || 'Alex';
    const macros = macrosFromCalories(suggestedCals, focusToDiaryGoal(focus));
    setGoal(focusToDiaryGoal(focus));
    updateProfile({
      name: displayName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      sex,
      weight: Number(weight) || 72,
      goalWeight: Number(goalWeight) || 68,
      calories: suggestedCals,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      age: Number(age) || 30,
      heightCm: Number(height) || 168,
      activity,
      diet: Object.keys(diet).filter((k) => diet[k]),
      focusGoals: Object.keys(focus).filter((k) => focus[k]),
      allergies: Object.keys(allergies).filter((k) => allergies[k]),
      conditions: Object.keys(conditions).filter((k) => conditions[k]),
    });
    updateReminder('breakfast', !!notifs.brief);
    updateReminder('lunch', !!notifs.gap);
    updateReminder('dinner', !!notifs.gap);
    updateReminder('water', !!notifs.water);
    updateReminder('weighIn', !!notifs.weekly);

    // Already signed in (e.g. finished profile later) → app.
    // New users → register page (email + password) after all 4 steps.
    if (isSignedIn) {
      onDone();
      return;
    }
    if (!navigation) {
      console.warn('Onboarding: navigation missing, cannot open SignUp');
      return;
    }
    navigation.navigate('SignUp', {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  const validateBodyStep = () => {
    const next = {
      firstName: validateName(firstName, 'First name'),
      lastName: validateName(lastName, 'Last name'),
      age: validateAge(age),
      height: validateHeightCm(height),
      weight: validateWeightKg(weight, 'Current weight'),
      goalWeight: validateWeightKg(goalWeight, 'Goal weight'),
    };
    setBodyErrors(next);
    setBodyTouched({
      firstName: true,
      lastName: true,
      age: true,
      height: true,
      weight: true,
      goalWeight: true,
    });
    return !Object.values(next).some(Boolean);
  };

  const next = () => {
    if (step === 0) {
      setStep(1);
      return;
    }
    if (step === 2 && !validateBodyStep()) {
      return;
    }
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }
    finish();
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const ctaLabel =
    step === 0
      ? 'Get started'
      : step === 4
        ? isSignedIn
          ? 'Start tracking'
          : 'Continue to register'
        : 'Continue';

  const grad = isDark
    ? ['#0A0A0A', '#000000', '#000000']
    : ['#E8F3FF', '#F7FAFD', '#FFFFFF'];

  return (
    <View style={[styles.root, { backgroundColor: c.pageBg }]}>
      <LinearGradient colors={grad} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <View style={[styles.blobA, { backgroundColor: isDark ? 'rgba(0,112,224,0.16)' : 'rgba(0,112,224,0.10)' }]} />
      <View style={[styles.blobB, { backgroundColor: isDark ? 'rgba(0,182,122,0.10)' : 'rgba(0,182,122,0.08)' }]} />

      <View style={[styles.safe, { paddingBottom: bottomPad }]}>
        <SafeAreaTop color="transparent" />
        {topPad <= 0 ? <View style={{ height: Platform.OS === 'web' ? 44 : 12 }} /> : null}

        <Animated.View style={[styles.flex, { opacity: fade, transform: [{ translateY: slide }] }]}>
          {step === 0 ? (
            <>
              <GetStartedStep theme={c} />
              <View style={styles.footer}>
                <AppButton label="Get started" onPress={next} size="lg" />
                <Pressable onPress={() => navigation?.navigate('SignIn')} style={styles.accountLink}>
                  <Text style={[styles.accountText, { color: c.muted, fontFamily: snPro('600') }]}>
                    I already have an account
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <OnboardHeader step={step} onBack={back} theme={c} />
              <ScrollView
                style={styles.flex}
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {step === 1 ? (
                  <GoalsStep focus={focus} setFocus={setFocus} theme={c} isDark={isDark} />
                ) : null}
                {step === 2 ? (
                  <BodyStep
                    firstName={firstName}
                    setFirstName={(v) => {
                      setFirstName(v);
                      if (bodyTouched.firstName) {
                        setBodyErrors((p) => ({ ...p, firstName: validateName(v, 'First name') }));
                      }
                    }}
                    lastName={lastName}
                    setLastName={(v) => {
                      setLastName(v);
                      if (bodyTouched.lastName) {
                        setBodyErrors((p) => ({ ...p, lastName: validateName(v, 'Last name') }));
                      }
                    }}
                    sex={sex}
                    setSex={setSex}
                    age={age}
                    setAge={(v) => {
                      setAge(v);
                      if (bodyTouched.age) setBodyErrors((p) => ({ ...p, age: validateAge(v) }));
                    }}
                    height={height}
                    setHeight={(v) => {
                      setHeight(v);
                      if (bodyTouched.height) {
                        setBodyErrors((p) => ({ ...p, height: validateHeightCm(v) }));
                      }
                    }}
                    weight={weight}
                    setWeight={(v) => {
                      setWeight(v);
                      if (bodyTouched.weight) {
                        setBodyErrors((p) => ({ ...p, weight: validateWeightKg(v, 'Current weight') }));
                      }
                    }}
                    goalWeight={goalWeight}
                    setGoalWeight={(v) => {
                      setGoalWeight(v);
                      if (bodyTouched.goalWeight) {
                        setBodyErrors((p) => ({
                          ...p,
                          goalWeight: validateWeightKg(v, 'Goal weight'),
                        }));
                      }
                    }}
                    activity={activity}
                    setActivity={setActivity}
                    suggestedCals={suggestedCals}
                    suggestedMacros={suggestedMacros}
                    errors={bodyErrors}
                    touched={bodyTouched}
                    onBlurField={(key) => {
                      setBodyTouched((p) => ({ ...p, [key]: true }));
                      setBodyErrors((p) => {
                        const next = { ...p };
                        if (key === 'firstName') next.firstName = validateName(firstName, 'First name');
                        if (key === 'lastName') next.lastName = validateName(lastName, 'Last name');
                        if (key === 'age') next.age = validateAge(age);
                        if (key === 'height') next.height = validateHeightCm(height);
                        if (key === 'weight') next.weight = validateWeightKg(weight, 'Current weight');
                        if (key === 'goalWeight') {
                          next.goalWeight = validateWeightKg(goalWeight, 'Goal weight');
                        }
                        return next;
                      });
                    }}
                    theme={c}
                    isDark={isDark}
                  />
                ) : null}
                {step === 3 ? (
                  <AllergiesStep
                    diet={diet}
                    setDiet={setDiet}
                    allergies={allergies}
                    setAllergies={setAllergies}
                    conditions={conditions}
                    setConditions={setConditions}
                    toggleMap={toggleMap}
                    theme={c}
                    isDark={isDark}
                  />
                ) : null}
                {step === 4 ? (
                  <NotifsStep notifs={notifs} setNotifs={setNotifs} theme={c} isDark={isDark} />
                ) : null}
              </ScrollView>
              <View style={styles.footer}>
                <AppButton label={ctaLabel} onPress={next} size="lg" />
              </View>
            </>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

function OnboardHeader({ step, onBack, theme }) {
  const pct = `${(step / 4) * 100}%`;
  return (
    <View style={styles.obHead}>
      <View style={styles.obHeadRow}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={[styles.backLbl, { color: theme.muted, fontFamily: snPro('600') }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.stepLbl, { fontFamily: snPro('800') }]}>STEP {step} OF 4</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: theme.track }]}>
        <View style={[styles.progressFill, { width: pct }]} />
      </View>
    </View>
  );
}

function GetStartedStep({ theme }) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.getStartScroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.startLogo}>
        <Text style={[styles.startLogoText, { fontFamily: snPro('800') }]}>H</Text>
      </View>
      <Text style={[styles.startTitle, { color: theme.text, fontFamily: FONT.nova }]}>
        Eat well without{'\n'}doing the maths.
      </Text>
      <Text style={[styles.startSub, { color: theme.muted, fontFamily: snPro('400') }]}>
        Snap a photo and Healthline reads the plate — calories, macros, allergens. Then it plans,
        shops and nudges around your life.
      </Text>
      <View style={styles.bulletList}>
        {START_BULLETS.map((line) => (
          <View key={line} style={styles.bulletRow}>
            <View style={styles.bulletDot} />
            <Text style={[styles.bulletText, { color: theme.text, fontFamily: snPro('500') }]}>{line}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function GoalsStep({ focus, setFocus, theme, isDark }) {
  const soft = softPrimary(isDark);
  return (
    <View>
      <Text style={[styles.h1, { color: theme.text, fontFamily: FONT.nova }]}>
        What should Healthline help you with?
      </Text>
      <Text style={[styles.sub, { color: theme.muted, fontFamily: snPro('400') }]}>
        Pick as many as you like — it shapes your targets and what the coach nudges you about.
      </Text>
      <View style={styles.list}>
        {FOCUS_GOALS.map((g) => {
          const on = !!focus[g.id];
          return (
            <Pressable
              key={g.id}
              onPress={() => setFocus((prev) => ({ ...prev, [g.id]: !prev[g.id] }))}
              style={[
                styles.selectCard,
                {
                  borderColor: on ? colors.primary : theme.border,
                  backgroundColor: on ? soft : theme.cardBg,
                },
              ]}
            >
              <View
                style={[
                  styles.checkBox,
                  {
                    borderColor: on ? colors.primary : theme.border,
                    backgroundColor: on ? colors.primary : 'transparent',
                  },
                ]}
              >
                {on ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.selectTitle, { color: theme.text, fontFamily: snPro('700') }]}>
                  {g.label}
                </Text>
                <Text style={[styles.selectSub, { color: theme.muted, fontFamily: snPro('400') }]}>
                  {g.sub}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function BodyStep({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  sex,
  setSex,
  age,
  setAge,
  height,
  setHeight,
  weight,
  setWeight,
  goalWeight,
  setGoalWeight,
  activity,
  setActivity,
  suggestedCals,
  suggestedMacros,
  errors = {},
  touched = {},
  onBlurField,
  theme,
  isDark,
}) {
  const soft = softPrimary(isDark);
  return (
    <View>
      <Text style={[styles.h1, { color: theme.text, fontFamily: FONT.nova }]}>A little about you</Text>
      <Text style={[styles.sub, { color: theme.muted, fontFamily: snPro('400') }]}>
        Only used to set your daily targets. You can change any of it later.
      </Text>

      <AppInput
        label="First name"
        value={firstName}
        onChangeText={setFirstName}
        onBlur={() => onBlurField?.('firstName')}
        placeholder="Alex"
        error={touched.firstName ? errors.firstName : ''}
        autoCapitalize="words"
        textContentType="givenName"
        autoComplete="given-name"
      />
      <AppInput
        label="Last name"
        value={lastName}
        onChangeText={setLastName}
        onBlur={() => onBlurField?.('lastName')}
        placeholder="Rivera"
        error={touched.lastName ? errors.lastName : ''}
        autoCapitalize="words"
        textContentType="familyName"
        autoComplete="family-name"
      />

      <Text style={[styles.sectionLbl, { color: theme.muted, fontFamily: snPro('600') }]}>Sex</Text>
      <View style={styles.sexList}>
        {SEX_OPTS.map((s) => {
          const on = sex === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => setSex(s.id)}
              style={[
                styles.sexRow,
                {
                  borderColor: on ? colors.primary : theme.border,
                  backgroundColor: on ? soft : theme.cardBg,
                },
              ]}
            >
              <View
                style={[
                  styles.sexRadio,
                  {
                    borderColor: on ? colors.primary : theme.border,
                    backgroundColor: on ? colors.primary : 'transparent',
                  },
                ]}
              >
                {on ? <Check size={11} color="#FFFFFF" strokeWidth={3} /> : null}
              </View>
              <Text
                style={[
                  styles.sexLbl,
                  { color: on ? colors.primary : theme.text, fontFamily: snPro('600') },
                ]}
              >
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.row2, styles.row2AfterSex]}>
        <View style={styles.row2Col}>
          <FieldCard
            label="Age"
            value={age}
            onChangeText={setAge}
            onBlur={() => onBlurField?.('age')}
            keyboardType="number-pad"
            theme={theme}
            error={touched.age ? errors.age : ''}
          />
        </View>
        <View style={styles.row2Col}>
          <FieldCard
            label="Height"
            value={height}
            onChangeText={setHeight}
            onBlur={() => onBlurField?.('height')}
            keyboardType="number-pad"
            suffix="cm"
            theme={theme}
            error={touched.height ? errors.height : ''}
          />
        </View>
      </View>

      <View style={styles.weightBlock}>
        <FieldCard
          label="Current weight"
          value={weight}
          onChangeText={setWeight}
          onBlur={() => onBlurField?.('weight')}
          keyboardType="decimal-pad"
          suffix="kg"
          large
          theme={theme}
          error={touched.weight ? errors.weight : ''}
        />
        <View style={{ height: 14 }} />
        <FieldCard
          label="Goal weight"
          value={goalWeight}
          onChangeText={setGoalWeight}
          onBlur={() => onBlurField?.('goalWeight')}
          keyboardType="decimal-pad"
          suffix="kg"
          large
          theme={theme}
          error={touched.goalWeight ? errors.goalWeight : ''}
        />
      </View>
      <Text style={[styles.sectionLbl, { color: theme.muted, fontFamily: snPro('600') }]}>
        How active are you?
      </Text>
      <View style={styles.actRow}>
        {ACTIVITY.map((a) => {
          const on = activity === a;
          return (
            <Pressable
              key={a}
              onPress={() => setActivity(a)}
              style={[
                styles.actChip,
                {
                  borderColor: on ? colors.primary : theme.border,
                  backgroundColor: on ? soft : theme.cardBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.actText,
                  { color: on ? colors.primary : theme.muted, fontFamily: snPro('700') },
                ]}
              >
                {a}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.suggestBox,
          {
            backgroundColor: soft,
            borderColor: isDark ? 'rgba(0,112,224,0.35)' : 'rgba(0,112,224,0.2)',
          },
        ]}
      >
        <Text style={[styles.suggestLbl, { fontFamily: snPro('600') }]}>Healthline suggests</Text>
        <View style={styles.suggestRow}>
          <Text style={[styles.suggestNum, { color: theme.text, fontFamily: FONT.nova }]}>
            {suggestedCals}
          </Text>
          <Text style={[styles.suggestUnit, { color: theme.muted, fontFamily: snPro('500') }]}>
            kcal / day
          </Text>
        </View>
        <Text style={[styles.suggestMacros, { color: theme.muted, fontFamily: snPro('500') }]}>
          P {suggestedMacros.protein}g · C {suggestedMacros.carbs}g · F {suggestedMacros.fat}g
        </Text>
      </View>
    </View>
  );
}

function FieldCard({ label, value, onChangeText, onBlur, keyboardType, suffix, large, theme, error }) {
  const text = String(value ?? '');
  const [inputW, setInputW] = useState(28);
  const hasError = !!error;

  return (
    <View style={styles.fieldCardWrap}>
      <View
        style={[
          styles.fieldCard,
          large && { marginTop: 0 },
          {
            borderColor: hasError ? colors.danger : theme.border,
            backgroundColor: theme.cardBg,
          },
        ]}
      >
        <Text style={[styles.fieldLbl, { color: theme.muted, fontFamily: snPro('600') }]}>{label}</Text>
        <View style={[styles.fieldValueRow, large && styles.fieldValueRowLarge]}>
          <Text
            style={[styles.fieldInput, styles.fieldMeasure, { color: theme.text, fontFamily: FONT.nova }]}
            onLayout={(e) => {
              const w = Math.ceil(e.nativeEvent.layout.width);
              setInputW(Math.max(w + 4, 20));
            }}
          >
            {text.length ? text : '0'}
          </Text>
          <TextInput
            value={text}
            onChangeText={onChangeText}
            onBlur={onBlur}
            keyboardType={keyboardType || 'default'}
            placeholderTextColor={theme.muted}
            underlineColorAndroid="transparent"
            selectionColor={colors.primary}
            style={[
              styles.fieldInput,
              { color: theme.text, fontFamily: FONT.nova, width: inputW },
              Platform.OS === 'web'
                ? { outlineStyle: 'none', outlineWidth: 0, outlineColor: 'transparent' }
                : null,
            ]}
          />
          {suffix ? (
            <Text style={[styles.fieldSuffix, { color: theme.muted, fontFamily: snPro('500') }]}>
              {suffix}
            </Text>
          ) : null}
        </View>
      </View>
      {hasError ? (
        <Text style={[styles.fieldError, { fontFamily: snPro('600') }]}>{error}</Text>
      ) : null}
    </View>
  );
}

function AllergiesStep({ diet, setDiet, allergies, setAllergies, conditions, setConditions, toggleMap, theme, isDark }) {
  const soft = softPrimary(isDark);
  const renderPills = (items, selected, setter) =>
    items.map((a) => {
      const on = !!selected[a];
      return (
        <Pressable
          key={a}
          onPress={() => toggleMap(setter, a)}
          style={[
            styles.pill,
            {
              borderColor: on ? colors.primary : theme.border,
              backgroundColor: on ? soft : theme.cardBg,
            },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              { color: on ? colors.primary : theme.text, fontFamily: snPro('600') },
            ]}
          >
            {a}
          </Text>
        </Pressable>
      );
    });

  return (
    <View>
      <Text style={[styles.h1, { color: theme.text, fontFamily: FONT.nova }]}>Anything to avoid?</Text>
      <Text style={[styles.sub, { color: theme.muted, fontFamily: snPro('400') }]}>
        Healthline will flag these in every scan, recipe and grocery list — for you and anyone you cook for.
      </Text>

      <Text style={[styles.chipSection, styles.chipSectionFirst, { color: theme.muted, fontFamily: snPro('800') }]}>
        DIET PREFERENCES
      </Text>
      <View style={styles.chipWrap}>{renderPills(DIET_OPTS, diet, setDiet)}</View>

      <Text style={[styles.chipSection, { color: theme.muted, fontFamily: snPro('800') }]}>
        ALLERGIES & INTOLERANCES
      </Text>
      <View style={styles.chipWrap}>{renderPills(ALLERGENS, allergies, setAllergies)}</View>

      <Text style={[styles.chipSection, { color: theme.muted, fontFamily: snPro('800') }]}>
        CONDITIONS
      </Text>
      <View style={styles.chipWrap}>{renderPills(CONDITIONS, conditions, setConditions)}</View>
    </View>
  );
}

function NotifsStep({ notifs, setNotifs, theme, isDark }) {
  return (
    <View>
      <Text style={[styles.h1, { color: theme.text, fontFamily: FONT.nova }]}>
        When should Healthline speak up?
      </Text>
      <Text style={[styles.sub, { color: theme.muted, fontFamily: snPro('400') }]}>
        Nudges are capped at three a day and never during quiet hours.
      </Text>

      <View style={[styles.notifCard, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
        {NOTIF_OPTS.map((n, i) => {
          const on = !!notifs[n.id];
          return (
            <Pressable
              key={n.id}
              onPress={() => setNotifs((prev) => ({ ...prev, [n.id]: !prev[n.id] }))}
              style={[
                styles.notifRow,
                i < NOTIF_OPTS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.notifTitle, { color: theme.text, fontFamily: snPro('700') }]}>
                  {n.label}
                </Text>
                <Text style={[styles.notifSub, { color: theme.muted, fontFamily: snPro('400') }]}>
                  {n.sub}
                </Text>
              </View>
              <View pointerEvents="none">
                <Switch
                  value={on}
                  onValueChange={() => {}}
                  trackColor={{ false: isDark ? '#3A3A3C' : '#D1D5DB', true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.quietRow, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.notifTitle, { color: theme.text, fontFamily: snPro('700') }]}>
            Quiet hours
          </Text>
          <Text style={[styles.notifSub, { color: theme.muted, fontFamily: snPro('400') }]}>
            No notifications in this window
          </Text>
        </View>
        <Text style={[styles.quietTime, { color: theme.text, fontFamily: FONT.nova }]}>22:00–07:00</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  blobA: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  blobB: {
    position: 'absolute',
    top: 180,
    left: -90,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  getStartScroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
  startLogo: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startLogoText: { color: '#FFFFFF', fontSize: 22 },
  startTitle: {
    marginTop: 28,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  startSub: { marginTop: 14, fontSize: 15, lineHeight: 24 },
  bulletList: { marginTop: 28, gap: 14 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bulletDot: { width: 7, height: 7, borderRadius: 99, backgroundColor: colors.primary },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20 },
  accountLink: { alignItems: 'center', paddingTop: 14, paddingBottom: 4 },
  accountText: { fontSize: 14 },
  obHead: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  obHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backLbl: { fontSize: 14 },
  stepLbl: { fontSize: 11, letterSpacing: 1, color: colors.primary },
  progressTrack: {
    marginTop: 12,
    height: 3,
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 99 },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24 },
  h1: { fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  sub: { marginTop: 8, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  list: { gap: 10 },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectTitle: { fontSize: 14 },
  selectSub: { fontSize: 12, marginTop: 2 },
  row2: { flexDirection: 'row', gap: 14 },
  row2Col: { flex: 1, minWidth: 0 },
  row2AfterSex: { marginTop: 20 },
  weightBlock: { marginTop: 16 },
  fieldCardWrap: { width: '100%' },
  fieldCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  fieldError: { color: colors.danger, fontSize: 11, marginTop: 6, lineHeight: 14 },
  fieldLbl: { fontSize: 11 },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
    gap: 6,
    position: 'relative',
  },
  fieldValueRowLarge: { justifyContent: 'flex-start' },
  fieldInput: {
    fontSize: 24,
    padding: 0,
    margin: 0,
    minHeight: 32,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  fieldMeasure: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    left: 0,
    top: 0,
  },
  fieldSuffix: { fontSize: 13, marginBottom: 4 },
  sectionLbl: { marginTop: 22, marginBottom: 12, fontSize: 13 },
  sexList: { gap: 10 },
  sexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  sexRadio: {
    width: 22,
    height: 22,
    borderRadius: 99,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sexLbl: { fontSize: 15, flex: 1 },
  actRow: { flexDirection: 'row', gap: 8 },
  actChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  actText: { fontSize: 12 },
  suggestBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestLbl: { fontSize: 12, color: colors.primary },
  suggestRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 },
  suggestNum: { fontSize: 30 },
  suggestUnit: { fontSize: 12 },
  suggestMacros: { fontSize: 13, marginTop: 8 },
  textFieldInput: { fontSize: 16, paddingVertical: 4, paddingHorizontal: 0 },
  chipSection: { fontSize: 10, letterSpacing: 1, marginTop: 22, marginBottom: 12 },
  chipSectionFirst: { marginTop: 4 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, rowGap: 12, columnGap: 12 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 99,
    borderWidth: 1.5,
  },
  pillText: { fontSize: 13 },
  notifCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  notifTitle: { fontSize: 14 },
  notifSub: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  quietRow: {
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quietTime: { fontSize: 17 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
});
