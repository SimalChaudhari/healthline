import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useTheme } from './ThemeContext';
import { colors, themeColors } from '../config/colors';
import { FONT, snPro } from '../config/fonts';

const ConfirmContext = createContext(null);

const DEFAULTS = {
  title: 'Delete record?',
  message: 'This cannot be undone.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  destructive: true,
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback((result) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setState(null);
    if (resolve) resolve(result);
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ ...DEFAULTS, ...options });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        visible={!!state}
        options={state || DEFAULTS}
        onCancel={() => close(false)}
        onConfirm={() => close(true)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

function ConfirmDialog({ visible, options, onCancel, onConfirm }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const destructive = options.destructive !== false;
  const accent = destructive ? colors.danger : colors.primary;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={[styles.sheet, { backgroundColor: c.cardBg, borderColor: c.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: destructive ? `${colors.danger}18` : colors.primarySoft }]}>
            <AlertTriangle size={22} color={accent} />
          </View>
          <Text style={[styles.title, { color: c.text, fontFamily: FONT.nova }]}>{options.title}</Text>
          <Text style={[styles.message, { color: c.muted, fontFamily: snPro('400') }]}>{options.message}</Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.btn,
                styles.cancelBtn,
                {
                  backgroundColor: isDark ? '#1C1C1E' : c.chip,
                  borderColor: c.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[styles.cancelText, { color: c.text, fontFamily: snPro('700') }]}>
                {options.cancelLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.btn,
                styles.confirmBtn,
                { backgroundColor: accent, opacity: pressed ? 0.88 : 1 },
              ]}
            >
              <Text style={[styles.confirmText, { fontFamily: snPro('700') }]}>{options.confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  sheet: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 10 },
    }),
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    marginRight: 10,
  },
  confirmBtn: {},
  cancelText: { fontSize: 15 },
  confirmText: { color: '#FFFFFF', fontSize: 15 },
});
