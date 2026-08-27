/**
 * Brand color palettes.
 * - blue  = current Healthline UI (default)
 * - green = NutriZen board theme
 * Active brand is driven by ThemeContext (persisted). Do not hardcode brand in screens.
 */

export const BRAND_BLUE = 'blue';
export const BRAND_GREEN = 'green';

export const BRAND_OPTIONS = [
  { id: BRAND_BLUE, label: 'Health line', hint: 'Blue' },
  { id: BRAND_GREEN, label: 'Health line', hint: 'Green' },
];

const NEUTRALS = {
  light: {
    pageBg: '#F4F6F8',
    cardBg: '#FFFFFF',
    elevated: '#FFFFFF',
    border: '#E6E8EC',
    text: '#111827',
    muted: '#6B7280',
    label: '#6B7280',
    placeholder: '#9CA3AF',
    invertBg: '#111827',
    invertText: '#FFFFFF',
    overlay: 'rgba(0,0,0,0.45)',
    track: '#EEF1F4',
    chip: '#F3F4F6',
    imageStage: '#EEF1F4',
  },
  dark: {
    pageBg: '#000000',
    cardBg: '#141414',
    elevated: '#1C1C1E',
    border: '#2A2A2A',
    text: '#F3F4F6',
    muted: '#9CA3AF',
    label: '#9CA3AF',
    placeholder: '#71717A',
    invertBg: '#FFFFFF',
    invertText: '#111827',
    overlay: 'rgba(0,0,0,0.72)',
    track: '#2A2A2A',
    chip: '#1C1C1E',
    imageStage: '#1C1C1E',
  },
};

/** Current Healthline blue brand (keep as default). */
const BLUE_BRAND = {
  id: BRAND_BLUE,
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
  /** rgb triple for rgba() overlays */
  primaryRgb: '0,112,224',
  pageBgLight: '#F4F6F8',
};

/** NutriZen green board — apply when user switches brand. */
const GREEN_BRAND = {
  id: BRAND_GREEN,
  primary: '#2ECC71',
  primaryDark: '#1E5631',
  primarySoft: '#E8F5E9',
  accent: '#27AE60',
  accentSoft: '#E8F5E9',
  /** Lime logo accent */
  lime: '#7EC845',
  forest: '#207235',
  aiPurple: '#6C5CE7',
  aiSoft: '#F0EDFF',
  carbs: '#FFA726',
  protein: '#42A5F5',
  fat: '#FF7043',
  exercise: '#66BB6A',
  danger: '#FF3B30',
  primaryRgb: '46,204,113',
  pageBgLight: '#F8F9FA',
};

/** Feature icon tile colors (NutriZen board). Shared across brands. */
export const featureColors = {
  foodTracking: '#FF9800',
  mealScanner: '#03A9F4',
  calorieCounter: '#F06292',
  macroTracking: '#9B59B6',
  waterTracker: '#26C6DA',
  exerciseLog: '#66BB6A',
  weightTracker: '#FFCA28',
  progressCharts: '#7986CB',
  healthyRecipes: '#9CCC65',
  mealPlanner: '#FF7043',
  aiCoach: '#0984E3',
  reminders: '#FD79A8',
};

export const BRAND_PALETTES = {
  [BRAND_BLUE]: BLUE_BRAND,
  [BRAND_GREEN]: GREEN_BRAND,
};

let activeBrandId = BRAND_BLUE;

export function getActiveBrandId() {
  return activeBrandId;
}

/** Called by ThemeProvider when brand changes (keeps static `colors` Proxy in sync). */
export function setActiveBrandId(brandId) {
  if (BRAND_PALETTES[brandId]) activeBrandId = brandId;
}

export function getBrandColors(brandId = activeBrandId) {
  return BRAND_PALETTES[brandId] || BLUE_BRAND;
}

/**
 * Live brand tokens. Prefer reading these during React render after useTheme()
 * so brand switches re-render correctly.
 */
export const colors = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === '__esModule') return false;
      const palette = getBrandColors();
      return palette[prop];
    },
    ownKeys() {
      return Reflect.ownKeys(getBrandColors());
    },
    getOwnPropertyDescriptor(_t, prop) {
      return {
        configurable: true,
        enumerable: true,
        value: getBrandColors()[prop],
      };
    },
  },
);

/** Neutrals + surface colors for light/dark. Soft page tint follows brand on light. */
export function themeColors(isDark, brandId = activeBrandId) {
  const brand = getBrandColors(brandId);
  const base = isDark ? NEUTRALS.dark : { ...NEUTRALS.light };
  if (!isDark && brand.pageBgLight) {
    base.pageBg = brand.pageBgLight;
  }
  return base;
}

export function primaryRgba(alpha = 1, brandId = activeBrandId) {
  const { primaryRgb } = getBrandColors(brandId);
  return `rgba(${primaryRgb},${alpha})`;
}

export default colors;
