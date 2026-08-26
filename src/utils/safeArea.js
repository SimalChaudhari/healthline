import { Platform, StatusBar, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Reliable top inset for status bar / notch / punch-hole.
 * Browser device frames often report 0 — infer a phone-like pad on web.
 */
export function resolveTopInset(reported, width = 390, height = 844) {
  if (reported > 0) return reported;

  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 28;
  }

  if (Platform.OS === 'web') {
    const aspect = height / Math.max(width, 1);
    const phoneLike = width > 0 && width <= 480;
    if (phoneLike && aspect >= 1.9) return 44;
    if (phoneLike) return 20;
    return 12;
  }

  // iOS fallback when insets not ready yet
  return 47;
}

/** Hook: safe top padding that works on native + web device emulators. */
export function useSafeTop() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  return resolveTopInset(insets.top, width, height);
}
