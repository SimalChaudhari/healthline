import { BRAND_BLUE, BRAND_GREEN } from './colors';

/** Official app display name (always two words). */
export const APP_NAME = 'Health line';
export const APP_FULL_NAME = `${APP_NAME} Nutrition`;

const ONBOARD_FEATURES = [
  { id: 'meals', title: 'Track Meals', sub: 'Log breakfast, lunch, dinner & snacks in seconds' },
  { id: 'goals', title: 'Reach Your Goals', sub: 'Calories and macros tailored to you' },
  { id: 'health', title: 'Stay Healthy', sub: 'Water, exercise and weekly progress' },
];

export const BRAND_CONTENT = {
  [BRAND_BLUE]: {
    appName: APP_NAME,
    logoLetter: 'H',
    tagline: 'Eat Smart • Live Better',
    welcomeTitle: 'Eat well without\ndoing the maths.',
    welcomeSub: `Snap a photo and ${APP_NAME} reads the plate — calories, macros, allergens. Then it plans, shops and nudges around your life.`,
    onboardFeatures: ONBOARD_FEATURES,
  },
  [BRAND_GREEN]: {
    appName: APP_NAME,
    logoLetter: 'H',
    tagline: 'Eat Smart • Live Better',
    welcomeTitle: `Welcome to\n${APP_NAME}`,
    welcomeSub: `Your personal nutrition companion — track meals, reach your goals, and stay healthy every day.`,
    onboardFeatures: ONBOARD_FEATURES,
  },
};

export function getBrandContent(brandId) {
  return BRAND_CONTENT[brandId] || BRAND_CONTENT[BRAND_BLUE];
}
