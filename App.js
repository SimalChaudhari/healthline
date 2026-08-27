import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DiaryProvider } from './src/context/DiaryContext';
import { AuthProvider } from './src/context/AuthContext';
import { ConfirmProvider } from './src/context/ConfirmContext';
import { FontProvider } from './src/config/FontProvider';
import ThemedStatusBar from './src/components/common/ThemedStatusBar';
import AppNavigator from './src/navigation/AppNavigator';

function buildNavTheme(isDark, brandColors, surfaces) {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: brandColors.primary,
      background: surfaces.pageBg,
      card: isDark ? '#000000' : surfaces.cardBg,
      text: surfaces.text,
      border: surfaces.border,
    },
  };
}

function AppContent() {
  const { isDark, colors: brandColors, themeColors: c } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.pageBg }}>
      <DiaryProvider>
        <AuthProvider>
          <ConfirmProvider>
            <NavigationContainer theme={buildNavTheme(isDark, brandColors, c)}>
              <ThemedStatusBar />
              <AppNavigator />
            </NavigationContainer>
          </ConfirmProvider>
        </AuthProvider>
      </DiaryProvider>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FontProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </FontProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
