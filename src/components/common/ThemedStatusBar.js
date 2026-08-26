import { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useTheme } from '../../context/ThemeContext';
import { themeColors } from '../../config/colors';

/**
 * Theme-aware status bar icons only.
 * With react-native-edge-to-edge, backgroundColor / translucent are ignored — do not set them.
 */
export default function ThemedStatusBar({ style: styleOverride, hidden = false }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const barStyle = styleOverride ?? (isDark ? 'light' : 'dark');

  useEffect(() => {
    setStatusBarStyle(barStyle);

    const apply = async () => {
      try {
        // Root / nav background — not the Android status-bar color API (edge-to-edge).
        await SystemUI.setBackgroundColorAsync(c.pageBg);
      } catch {
        // unsupported platform
      }
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        let meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'theme-color');
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', c.pageBg);
      }
    };
    apply();
  }, [isDark, c.pageBg, barStyle]);

  return <StatusBar style={barStyle} hidden={hidden} />;
}
