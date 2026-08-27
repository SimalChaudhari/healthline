import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BRAND_BLUE,
  BRAND_GREEN,
  BRAND_OPTIONS,
  BRAND_PALETTES,
  featureColors,
  getBrandColors,
  setActiveBrandId,
  themeColors as buildThemeColors,
  primaryRgba,
} from '../config/colors';
import { THEME_MODE_KEY, COLOR_BRAND_KEY } from '../config/storageKeys';

export const ThemeContext = createContext(null);

/**
 * Light/dark mode + brand color theme (Blue | Green).
 * Default brand stays Healthline Blue so current UI is unchanged until user switches.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');
  const [brand, setBrandState] = useState(BRAND_BLUE);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [mode, brandId] = await Promise.all([
          AsyncStorage.getItem(THEME_MODE_KEY),
          AsyncStorage.getItem(COLOR_BRAND_KEY),
        ]);
        if (cancelled) return;
        if (mode === 'dark' || mode === 'light') setThemeState(mode);
        if (brandId && BRAND_PALETTES[brandId]) {
          setActiveBrandId(brandId);
          setBrandState(brandId);
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback(async (value) => {
    if (value !== 'light' && value !== 'dark') return;
    setThemeState(value);
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, value);
    } catch (_) {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_MODE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const setBrand = useCallback(async (brandId) => {
    if (!BRAND_PALETTES[brandId]) return;
    setActiveBrandId(brandId);
    setBrandState(brandId);
    try {
      await AsyncStorage.setItem(COLOR_BRAND_KEY, brandId);
    } catch (_) {}
  }, []);

  const toggleBrand = useCallback(() => {
    setBrandState((prev) => {
      const next = prev === BRAND_BLUE ? BRAND_GREEN : BRAND_BLUE;
      setActiveBrandId(next);
      AsyncStorage.setItem(COLOR_BRAND_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const isDark = theme === 'dark';
  const brandColors = useMemo(() => getBrandColors(brand), [brand]);
  const surfaces = useMemo(() => buildThemeColors(isDark, brand), [isDark, brand]);

  const value = useMemo(
    () => ({
      /** light | dark */
      theme,
      isDark,
      setTheme,
      toggleTheme,
      /** blue | green */
      brand,
      brandColors,
      colors: brandColors,
      featureColors,
      brandOptions: BRAND_OPTIONS,
      setBrand,
      toggleBrand,
      isGreenBrand: brand === BRAND_GREEN,
      isBlueBrand: brand === BRAND_BLUE,
      /** page/card/text surfaces for current mode + brand */
      themeColors: surfaces,
      c: surfaces,
      primaryRgba: (alpha) => primaryRgba(alpha, brand),
    }),
    [theme, isDark, setTheme, toggleTheme, brand, brandColors, setBrand, toggleBrand, surfaces],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/** Convenience: brand colors + surfaces in one hook. */
export function useAppColors() {
  const { colors, themeColors, isDark, brand, primaryRgba } = useTheme();
  return { colors, themeColors, isDark, brand, primaryRgba };
}
