import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useDiary } from '../../context/DiaryContext';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';
import { SafeAreaTop } from '../../components/common/ScreenShell';
import { useSafeTop } from '../../utils/safeArea';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARD_KEY } from '../../config/storageKeys';
import {
  validateEmail,
  validatePassword,
  validateLoginPassword,
  validateConfirmPassword,
  PASSWORD_MIN,
  PASSWORD_MAX,
} from '../../utils/validation';

function AuthScaffold({ children, title, sub, onBack, footer }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const topPad = useSafeTop();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 16);
  const grad = isDark
    ? ['#0A0A0A', '#000000', '#000000']
    : ['#E8F3FF', '#F7FAFD', '#FFFFFF'];

  return (
    <View style={[styles.root, { backgroundColor: c.pageBg }]}>
      <LinearGradient colors={grad} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
      <View
        pointerEvents="none"
        style={[styles.blob, { backgroundColor: isDark ? 'rgba(0,112,224,0.14)' : 'rgba(0,112,224,0.08)' }]}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.safe, { paddingBottom: bottomPad }]}>
          <SafeAreaTop color="transparent" />
          {topPad <= 0 ? <View style={{ height: Platform.OS === 'web' ? 36 : 8 }} /> : null}

          <View style={styles.topBar}>
            {onBack ? (
              <Pressable onPress={onBack} hitSlop={10} style={styles.backHit}>
                <Text style={[styles.backLbl, { color: c.muted, fontFamily: snPro('600') }]}>← Back</Text>
              </Pressable>
            ) : (
              <View style={styles.backHit} />
            )}
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logo}>
              <Text style={[styles.logoText, { fontFamily: snPro('800') }]}>H</Text>
            </View>
            <Text style={[styles.title, { color: c.text, fontFamily: FONT.nova }]}>{title}</Text>
            {sub ? (
              <Text style={[styles.sub, { color: c.muted, fontFamily: snPro('400') }]}>{sub}</Text>
            ) : null}
            <View style={styles.form}>{children}</View>
          </ScrollView>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export function SignUpScreen({ navigation, route, onRegistered }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { signUp } = useAuth();
  const { updateProfile } = useDiary();
  const firstName = route?.params?.firstName || '';
  const lastName = route?.params?.lastName || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', confirm: '' });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const setField = (key, value) => {
    if (key === 'email') setEmail(value);
    if (key === 'password') setPassword(value);
    if (key === 'confirm') setConfirm(value);
    setFormError('');
    if (touched[key] || errors[key]) {
      setErrors((prev) => ({
        ...prev,
        email: key === 'email' ? validateEmail(value) : prev.email,
        password: key === 'password' ? validatePassword(value) : prev.password,
        confirm:
          key === 'confirm' || key === 'password'
            ? validateConfirmPassword(key === 'password' ? value : password, key === 'confirm' ? value : confirm)
            : prev.confirm,
      }));
    }
  };

  const touch = (key) => setTouched((prev) => ({ ...prev, [key]: true }));

  const validateAll = () => {
    const next = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validateConfirmPassword(password, confirm),
    };
    setErrors(next);
    setTouched({ email: true, password: true, confirm: true });
    return !next.email && !next.password && !next.confirm;
  };

  const onSubmit = async () => {
    setFormError('');
    if (!validateAll()) return;

    setLoading(true);
    const res = await signUp({ email, password, firstName, lastName });
    setLoading(false);
    if (!res.ok) {
      if (/email/i.test(res.error || '')) setErrors((p) => ({ ...p, email: res.error }));
      else setFormError(res.error);
      return;
    }
    const display = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ');
    if (display) {
      updateProfile({
        name: display,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    }
    if (onRegistered) {
      await onRegistered();
      return;
    }
    try {
      await AsyncStorage.setItem(ONBOARD_KEY, '1');
    } catch {
      // continue
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const displayName = [firstName, lastName].filter(Boolean).join(' ');

  return (
    <AuthScaffold
      title="Register"
      sub="Add your email and password to save your profile on this device."
      onBack={() => navigation.goBack()}
      footer={
        <>
          {formError ? <Text style={[styles.error, { fontFamily: snPro('600') }]}>{formError}</Text> : null}
          <AppButton label="Create account" onPress={onSubmit} loading={loading} size="lg" />
          <Pressable onPress={() => navigation.navigate('SignIn')} style={styles.linkWrap}>
            <Text style={[styles.link, { color: c.muted, fontFamily: snPro('600') }]}>
              Already have an account? <Text style={{ color: colors.primary }}>Sign in</Text>
            </Text>
          </Pressable>
        </>
      }
    >
      {displayName ? (
        <View
          style={[
            styles.profileChip,
            {
              backgroundColor: isDark ? 'rgba(0,112,224,0.16)' : colors.primarySoft,
              borderColor: c.border,
            },
          ]}
        >
          <Text style={[styles.profileChipLbl, { color: colors.primary, fontFamily: snPro('700') }]}>
            Profile ready
          </Text>
          <Text style={[styles.profileChipName, { color: c.text, fontFamily: snPro('600') }]}>
            {displayName}
          </Text>
        </View>
      ) : null}
      <AppInput
        label="Email"
        value={email}
        onChangeText={(v) => setField('email', v)}
        onBlur={() => {
          touch('email');
          setErrors((p) => ({ ...p, email: validateEmail(email) }));
        }}
        placeholder="you@email.com"
        error={touched.email ? errors.email : ''}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
      />
      <AppInput
        label="Password"
        value={password}
        onChangeText={(v) => setField('password', v)}
        onBlur={() => {
          touch('password');
          setErrors((p) => ({
            ...p,
            password: validatePassword(password),
            confirm: touched.confirm ? validateConfirmPassword(password, confirm) : p.confirm,
          }));
        }}
        placeholder={`At least ${PASSWORD_MIN} characters`}
        secure
        showStrength
        maxLength={PASSWORD_MAX}
        error={touched.password ? errors.password : ''}
        textContentType="newPassword"
        autoComplete="new-password"
      />
      <AppInput
        label="Confirm password"
        value={confirm}
        onChangeText={(v) => setField('confirm', v)}
        onBlur={() => {
          touch('confirm');
          setErrors((p) => ({ ...p, confirm: validateConfirmPassword(password, confirm) }));
        }}
        placeholder="Repeat password"
        secure
        maxLength={PASSWORD_MAX}
        error={touched.confirm ? errors.confirm : ''}
        textContentType="newPassword"
        autoComplete="new-password"
      />
    </AuthScaffold>
  );
}

export function SignInScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validateAll = () => {
    const next = {
      email: validateEmail(email),
      password: validateLoginPassword(password),
    };
    setErrors(next);
    setTouched({ email: true, password: true });
    return !next.email && !next.password;
  };

  const onSubmit = async () => {
    setFormError('');
    if (!validateAll()) return;

    setLoading(true);
    const res = await signIn({ email, password });
    setLoading(false);
    if (!res.ok) {
      if (/password/i.test(res.error || '')) setErrors((p) => ({ ...p, password: res.error }));
      else if (/email|account|found/i.test(res.error || '')) setErrors((p) => ({ ...p, email: res.error }));
      else setFormError(res.error);
      return;
    }
    let onboard = false;
    try {
      onboard = (await AsyncStorage.getItem(ONBOARD_KEY)) === '1';
    } catch {
      onboard = false;
    }
    navigation.reset({
      index: 0,
      routes: [
        onboard
          ? { name: 'Main' }
          : { name: 'Onboarding', params: { initialStep: 1 } },
      ],
    });
  };

  return (
    <AuthScaffold
      title="Welcome back"
      sub="Sign in to pick up where you left off."
      onBack={() => navigation.goBack()}
      footer={
        <>
          {formError ? <Text style={[styles.error, { fontFamily: snPro('600') }]}>{formError}</Text> : null}
          <AppButton label="Sign in" onPress={onSubmit} loading={loading} size="lg" />
          <Text style={[styles.hint, { color: c.muted, fontFamily: snPro('500') }]}>
            New here? Go back and tap Get started — register after your profile steps.
          </Text>
        </>
      }
    >
      <AppInput
        label="Email"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setFormError('');
          if (touched.email) setErrors((p) => ({ ...p, email: validateEmail(v) }));
        }}
        onBlur={() => {
          setTouched((p) => ({ ...p, email: true }));
          setErrors((p) => ({ ...p, email: validateEmail(email) }));
        }}
        placeholder="you@email.com"
        error={touched.email ? errors.email : ''}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
      />
      <AppInput
        label="Password"
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          setFormError('');
          if (touched.password) setErrors((p) => ({ ...p, password: validateLoginPassword(v) }));
        }}
        onBlur={() => {
          setTouched((p) => ({ ...p, password: true }));
          setErrors((p) => ({ ...p, password: validateLoginPassword(password) }));
        }}
        placeholder={`At least ${PASSWORD_MIN} characters`}
        secure
        maxLength={PASSWORD_MAX}
        error={touched.password ? errors.password : ''}
        hint={`Must be ${PASSWORD_MIN}–${PASSWORD_MAX} characters.`}
        textContentType="password"
        autoComplete="password"
      />
      <Pressable onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgot}>
        <Text style={[styles.forgotText, { color: colors.primary, fontFamily: snPro('600') }]}>
          Forgot password?
        </Text>
      </Pressable>
    </AuthScaffold>
  );
}

export function ForgotPasswordScreen({ navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const onSubmit = async () => {
    const err = validateEmail(email);
    setTouched(true);
    setError(err);
    if (err) return;

    setLoading(true);
    const res = await requestPasswordReset({ email });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSent(true);
  };

  return (
    <AuthScaffold
      title="Reset password"
      sub="Demo only — we’ll confirm here, no email is sent."
      onBack={() => navigation.goBack()}
      footer={
        sent ? null : (
          <AppButton label="Send reset link" onPress={onSubmit} loading={loading} size="lg" />
        )
      }
    >
      {sent ? (
        <View
          style={[
            styles.sentBox,
            {
              backgroundColor: isDark ? 'rgba(0,112,224,0.16)' : colors.primarySoft,
              borderColor: c.border,
            },
          ]}
        >
          <Text style={[styles.sentTitle, { color: c.text, fontFamily: snPro('700') }]}>Check your inbox</Text>
          <Text style={[styles.sentBody, { color: c.muted, fontFamily: snPro('400') }]}>
            If an account exists for {email.trim() || 'that email'}, a reset link would arrive shortly.
          </Text>
          <AppButton
            label="Back to sign in"
            onPress={() => navigation.navigate('SignIn')}
            size="lg"
            style={{ marginTop: 14 }}
          />
        </View>
      ) : (
        <AppInput
          label="Email"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (touched) setError(validateEmail(v));
          }}
          onBlur={() => {
            setTouched(true);
            setError(validateEmail(email));
          }}
          placeholder="you@email.com"
          error={touched ? error : ''}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
        />
      )}
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  flex: { flex: 1 },
  safe: { flex: 1 },
  blob: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  topBar: {
    paddingHorizontal: 20,
    minHeight: 36,
    justifyContent: 'center',
  },
  backHit: { alignSelf: 'flex-start', paddingVertical: 6, paddingRight: 12 },
  backLbl: { fontSize: 14 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexGrow: 1,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 99,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: { color: '#FFFFFF', fontSize: 18 },
  title: {
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 8,
    paddingRight: 8,
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
    paddingRight: 4,
  },
  form: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  error: { color: colors.danger, fontSize: 13, marginBottom: 8 },
  forgot: { alignSelf: 'flex-end', marginBottom: 4, marginTop: -8, paddingVertical: 6 },
  forgotText: { fontSize: 13 },
  linkWrap: { alignItems: 'center', marginTop: 14, paddingVertical: 6 },
  link: { fontSize: 14, textAlign: 'center' },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 14, lineHeight: 18, paddingHorizontal: 8 },
  profileChip: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  profileChipLbl: { fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 },
  profileChipName: { fontSize: 16 },
  sentBox: { borderWidth: 1, borderRadius: 16, padding: 16 },
  sentTitle: { fontSize: 16, marginBottom: 6 },
  sentBody: { fontSize: 13, lineHeight: 19 },
});
