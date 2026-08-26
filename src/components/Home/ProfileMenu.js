import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  User,
  BookOpen,
  ChartLine,
  Settings,
  Moon,
  Target,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useDiary } from '../../context/DiaryContext';
import { colors, themeColors } from '../../config/colors';
import { FONT, snPro } from '../../config/fonts';

const GOAL_LABEL = { lose: 'Lose weight', maintain: 'Maintain', gain: 'Gain muscle' };

export default function ProfileMenu({ visible, onClose, navigation }) {
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const c = themeColors(isDark);
  const { profile, goal } = useDiary();

  const go = (tab) => {
    onClose();
    setTimeout(() => navigation.navigate(tab), 120);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: c.cardBg,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <Text style={[styles.sheetTitle, { color: c.text, fontFamily: FONT.nova }]}>Menu</Text>
            <Pressable onPress={onClose} hitSlop={10} style={[styles.closeBtn, { backgroundColor: c.chip }]}>
              <X size={18} color={c.text} />
            </Pressable>
          </View>

          <View style={[styles.profileCard, { backgroundColor: isDark ? '#1C1C1E' : colors.primarySoft, borderColor: c.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{profile.name.slice(0, 1)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: c.text }]}>{profile.name}</Text>
              <Text style={[styles.meta, { color: c.muted }]}>
                {GOAL_LABEL[goal]} · {profile.calories} kcal
              </Text>
            </View>
          </View>

          <MenuItem icon={BookOpen} label="Diary" theme={c} onPress={() => go('Diary')} />
          <MenuItem icon={ChartLine} label="Progress" theme={c} onPress={() => go('Progress')} />
          <MenuItem icon={Settings} label="More settings" theme={c} onPress={() => go('More')} />
          <MenuItem icon={Target} label="Nutrition goals" theme={c} onPress={() => go('More')} />

          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: isDark ? '#1C1C1E' : c.chip,
                borderColor: c.border,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <View style={[styles.rowIcon, { backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF' }]}>
              <Moon size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: c.text }]}>Dark mode</Text>
              <Text style={[styles.rowSub, { color: c.muted }]}>Toggle app theme</Text>
            </View>
            <Switch
              value={isDark}
              pointerEvents="none"
              trackColor={{ false: isDark ? '#3A3A3C' : '#D1D5DB', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </Pressable>

          <Pressable
            style={[styles.viewProfile, { borderColor: c.border }]}
            onPress={() => go('More')}
          >
            <User size={16} color={colors.primary} />
            <Text style={styles.viewProfileText}>View full profile</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MenuItem({ icon: Icon, label, theme, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: pressed ? theme.chip : 'transparent',
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
        <Icon size={18} color={colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: theme.text, fontFamily: snPro('600') }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 },
      },
      android: { elevation: 12 },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    backgroundColor: '#C5CCD6',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 22, fontWeight: '400' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },
  name: { fontSize: 17, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  menuLabel: { fontSize: 15, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12, marginTop: 2 },
  viewProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 99,
    height: 46,
    marginBottom: 4,
  },
  viewProfileText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
