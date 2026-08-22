/** MyFitnessPal-inspired palette, branded for Healthline Nutrition. */
export const colors = {
  primary: '#0070E0',
  primaryDark: '#005BB5',
  primarySoft: '#E8F3FF',
  accent: '#00B67A',
  accentSoft: '#E6F8F1',
  aiPurple: '#6C5CE7',
  aiSoft: '#F0EDFF',
  carbs: '#FF9500',
  protein: '#AF52DE',
  fat: '#5AC8FA',
  exercise: '#34C759',
  danger: '#FF3B30',
};

export function themeColors(isDark) {
  return {
    pageBg: isDark ? '#000000' : '#F4F6F8',
    cardBg: isDark ? '#141414' : '#FFFFFF',
    elevated: isDark ? '#1C1C1E' : '#FFFFFF',
    border: isDark ? '#2A2A2A' : '#E6E8EC',
    text: isDark ? '#F3F4F6' : '#111827',
    muted: isDark ? '#9CA3AF' : '#6B7280',
    label: isDark ? '#9CA3AF' : '#6B7280',
    invertBg: isDark ? '#FFFFFF' : '#111827',
    invertText: isDark ? '#111827' : '#FFFFFF',
    overlay: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.45)',
    track: isDark ? '#2A2A2A' : '#EEF1F4',
    chip: isDark ? '#1C1C1E' : '#F3F4F6',
  };
}

export default colors;
