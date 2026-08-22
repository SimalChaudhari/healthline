# CLAUDE.md

Healthline Nutrition — Expo UI template inspired by [MyFitnessPal](https://play.google.com/store/apps/details?id=com.myfitnesspal.android) and [Healthline’s nutrition-app roundup](https://www.healthline.com/nutrition/top-iphone-android-apps).

Created with `create-expo-app` (Expo 54 — same as Example APk / Expo Go on device). UI only — no API. AI scan / voice screens are placeholders.

## Commands

```bash
npm run web        # localhost:8081
npm run web:alt    # localhost:8082
npm run android
npm run ios
npm start
```

## Architecture

```
src/
├── config/colors.js
├── context/ThemeContext.js, DiaryContext.js
├── data/foods.js, recipes.js
├── navigation/AppNavigator.js, MainTabs.js
├── components/   # ProgressRing, MacroBar, MealSection, AiBadge
└── screens/      # Dashboard, Diary, Discover, Progress, More,
                  # AddFood, FoodDetail, ScanFood, VoiceLog, RecipeDetail
```

Local diary state only. Scan + voice can demo-log sample foods; wire models later.

## Theme

`useTheme()` — never hardcode light/dark:

- page `#F4F6F8` / `#000000`
- card `#FFFFFF` / `#141414`
- brand blue `#0070E0`
- AI purple `#6C5CE7`

## Fonts

- **SN Pro** — body / UI (`fontWeight` auto-maps via `FontProvider`)
- **Nova Round** — display titles (`fontFamily: FONT.nova`)

```js
import { FONT } from '../config/fonts';
// headline
style={{ fontFamily: FONT.nova }}
```
