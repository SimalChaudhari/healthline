import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { themeColors, colors } from '../config/colors';
import MainTabs from './MainTabs';
import OnboardingScreen from '../screens/OnboardingScreen';
import AddFoodScreen from '../screens/AddFoodScreen';
import FoodDetailScreen from '../screens/FoodDetailScreen';
import ScanFoodScreen from '../screens/ScanFoodScreen';
import VoiceLogScreen from '../screens/VoiceLogScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';

const Stack = createNativeStackNavigator();
const ONBOARD_KEY = 'healthline_onboarded_v2';

export default function AppNavigator() {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARD_KEY)
      .then((v) => {
        setOnboarded(v === '1');
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.pageBg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={onboarded ? 'Main' : 'Onboarding'}
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.pageBg } }}
    >
      <Stack.Screen name="Onboarding">
        {(props) => (
          <OnboardingScreen
            {...props}
            onDone={async () => {
              await AsyncStorage.setItem(ONBOARD_KEY, '1');
              setOnboarded(true);
              props.navigation.replace('Main');
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
      <Stack.Screen name="ScanFood" component={ScanFoodScreen} />
      <Stack.Screen name="VoiceLog" component={VoiceLogScreen} />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{
          statusBarStyle: 'light',
          ...(Platform.OS === 'android' ? { statusBarTranslucent: true } : {}),
        }}
      />
    </Stack.Navigator>
  );
}
