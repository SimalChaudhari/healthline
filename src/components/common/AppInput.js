import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Eye, EyeOff, CircleAlert, Check, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { colors, themeColors } from '../../config/colors';
import { snPro } from '../../config/fonts';
import {
  passwordRules,
  passwordStrength,
  passwordStrengthLabel,
  passwordStrengthColor,
} from '../../utils/validation';

function webAutofillStyle(fill, textColor) {
  if (Platform.OS !== 'web') return null;
  return {
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
    backgroundColor: fill,
    boxShadow: `0 0 0px 1000px ${fill} inset`,
    WebkitTextFillColor: textColor,
    caretColor: textColor,
  };
}

/**
 * Shared text field — label, focus ring, error/hint prompts, optional password
 * strength meter + rule checklist.
 */
export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secure = false,
  error = '',
  hint = '',
  showStrength = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  onBlur,
  onFocus,
  style,
  inputStyle,
  ...rest
}) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const fill = isDark ? '#1C1C1E' : '#F4F6F8';
  const hasError = !!error;
  const borderColor = hasError ? colors.danger : focused ? colors.primary : c.border;
  const showMeter = showStrength && secure;
  const hasValue = String(value || '').length > 0;
  const strength = showMeter ? passwordStrength(value) : 0;
  const strengthLbl = passwordStrengthLabel(strength);
  const strengthClr = passwordStrengthColor(strength);
  const rules = showMeter ? passwordRules(value) : [];

  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <Text style={[styles.label, { color: c.muted, fontFamily: snPro('600') }]}>{label}</Text>
      ) : null}

      <View style={[styles.box, { backgroundColor: fill, borderColor }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          secureTextEntry={secure && !show}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete || 'off'}
          textContentType={textContentType || 'none'}
          importantForAutofill="no"
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            { color: c.text, fontFamily: snPro('600'), backgroundColor: fill },
            webAutofillStyle(fill, c.text),
            inputStyle,
          ]}
          {...rest}
        />
        {hasError && !secure ? (
          <View style={styles.trailing}>
            <CircleAlert size={18} color={colors.danger} />
          </View>
        ) : null}
        {secure ? (
          <Pressable onPress={() => setShow((v) => !v)} hitSlop={8} style={styles.trailing}>
            {show ? <EyeOff size={18} color={c.muted} /> : <Eye size={18} color={c.muted} />}
          </Pressable>
        ) : null}
      </View>

      {showMeter ? (
        <View style={styles.strengthBlock}>
          {hasValue ? (
            <>
              <View style={styles.strengthRow}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSeg,
                      {
                        backgroundColor: i < strength ? strengthClr : isDark ? '#2A2A2A' : '#E6E8EC',
                      },
                    ]}
                  />
                ))}
              </View>
              {strengthLbl ? (
                <Text style={[styles.strengthLbl, { color: strengthClr, fontFamily: snPro('600') }]}>
                  {strengthLbl}
                </Text>
              ) : null}
            </>
          ) : null}

          <View style={styles.rules}>
            {rules.map((r) => {
              const ok = r.ok;
              const tone = !hasValue ? c.muted : ok ? colors.accent : colors.danger;
              return (
                <View key={r.id} style={styles.ruleRow}>
                  <View
                    style={[
                      styles.ruleIcon,
                      {
                        backgroundColor: !hasValue
                          ? isDark
                            ? '#2A2A2A'
                            : '#E6E8EC'
                          : ok
                            ? `${colors.accent}22`
                            : `${colors.danger}22`,
                      },
                    ]}
                  >
                    {ok && hasValue ? (
                      <Check size={11} color={colors.accent} strokeWidth={3} />
                    ) : (
                      <X size={11} color={tone} strokeWidth={3} />
                    )}
                  </View>
                  <Text style={[styles.ruleText, { color: tone, fontFamily: snPro('500') }]}>
                    {r.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {hasError ? (
        <Text style={[styles.error, { fontFamily: snPro('600') }]}>{error}</Text>
      ) : hint && !showMeter ? (
        <Text style={[styles.hint, { color: c.muted, fontFamily: snPro('500') }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', marginBottom: 14 },
  label: {
    fontSize: 13,
    marginBottom: 8,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    margin: 0,
  },
  trailing: { paddingLeft: 8, paddingVertical: 6 },
  strengthBlock: { marginTop: 10 },
  strengthRow: { flexDirection: 'row', gap: 6 },
  strengthSeg: {
    flex: 1,
    height: 4,
    borderRadius: 99,
  },
  strengthLbl: { fontSize: 12, marginTop: 6 },
  rules: { marginTop: 10, gap: 8 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleIcon: {
    width: 18,
    height: 18,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleText: { fontSize: 12, flex: 1, lineHeight: 16 },
  error: { color: colors.danger, fontSize: 12, marginTop: 6, lineHeight: 16 },
  hint: { fontSize: 12, marginTop: 6, lineHeight: 16 },
});
