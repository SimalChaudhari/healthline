import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DiaryProvider } from './src/context/DiaryContext';
import { ConfirmProvider } from './src/context/ConfirmContext';
import { FontProvider } from './src/config/FontProvider';
import AppNavigator from './src/navigation/AppNavigator';

function buildNavTheme(isDark) {
  const base = isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: '#0070E0',
      background: isDark ? '#000000' : '#F4F6F8',
      card: isDark ? '#000000' : '#FFFFFF',
      text: isDark ? '#F3F4F6' : '#111827',
      border: isDark ? '#2A2A2A' : '#E6E8EC',
    },
  };
}

function AppContent() {
  const { isDark } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#000000' : '#F4F6F8' }}>
      <DiaryProvider>
        <ConfirmProvider>
          <NavigationContainer theme={buildNavTheme(isDark)}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <AppNavigator />
          </NavigationContainer>
        </ConfirmProvider>
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
