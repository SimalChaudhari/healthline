import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { themeColors, colors } from '../config/colors';
import MainTabs from './MainTabs';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import { SignInScreen, SignUpScreen, ForgotPasswordScreen } from '../screens/Auth/AuthScreens';
import AddFoodScreen from '../screens/Diary/AddFoodScreen';
import FoodDetailScreen from '../screens/Diary/FoodDetailScreen';
import ScanFoodScreen from '../screens/Diary/ScanFoodScreen';
import VoiceLogScreen from '../screens/Diary/VoiceLogScreen';
import ManualFoodScreen from '../screens/Diary/ManualFoodScreen';
import RecipeDetailScreen from '../screens/Discover/RecipeDetailScreen';
import EditGoalsScreen from '../screens/Progress/EditGoalsScreen';
import LogWeightScreen from '../screens/Progress/LogWeightScreen';
import LogExerciseScreen from '../screens/Diary/LogExerciseScreen';
import RemindersScreen from '../screens/More/RemindersScreen';
import ProfileEditScreen from '../screens/More/ProfileEditScreen';
import PrivacyPolicyScreen from '../screens/More/PrivacyPolicyScreen';
import AboutUsScreen from '../screens/More/AboutUsScreen';
import FavoritesScreen from '../screens/Diary/FavoritesScreen';
import BarcodeScanScreen from '../screens/Diary/BarcodeScanScreen';
import WeeklyReportScreen from '../screens/Progress/WeeklyReportScreen';
import MealPlanScreen from '../screens/Home/MealPlanScreen';
import GroceryListScreen from '../screens/Home/GroceryListScreen';
import CoachScreen from '../screens/Home/CoachScreen';
import HealthTracksScreen from '../screens/Home/HealthTracksScreen';
import HealthTrackDetailScreen from '../screens/Home/HealthTrackDetailScreen';
import ProgramsScreen from '../screens/Home/ProgramsScreen';
import ProgramDetailScreen from '../screens/Home/ProgramDetailScreen';
import FeaturesHubScreen from '../screens/Home/FeaturesHubScreen';

import { ONBOARD_KEY } from '../config/storageKeys';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const { hydrated: authReady, isSignedIn } = useAuth();
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

  if (!ready || !authReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.pageBg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const initialRouteName = isSignedIn && onboarded ? 'Main' : 'Onboarding';
  const defaultOnboardStep = isSignedIn && !onboarded ? 1 : 0;

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.pageBg },
        statusBarStyle: isDark ? 'light' : 'dark',
      }}
    >
      <Stack.Screen name="Onboarding">
        {(props) => (
          <OnboardingScreen
            {...props}
            initialStep={props.route.params?.initialStep ?? defaultOnboardStep}
            onDone={async () => {
              await AsyncStorage.setItem(ONBOARD_KEY, '1');
              setOnboarded(true);
              props.navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp">
        {(props) => (
          <SignUpScreen
            {...props}
            onRegistered={async () => {
              await AsyncStorage.setItem(ONBOARD_KEY, '1');
              setOnboarded(true);
              props.navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AddFood" component={AddFoodScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ManualFood" component={ManualFoodScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
      <Stack.Screen name="ScanFood" component={ScanFoodScreen} />
      <Stack.Screen name="VoiceLog" component={VoiceLogScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="EditGoals" component={EditGoalsScreen} />
      <Stack.Screen name="LogWeight" component={LogWeightScreen} />
      <Stack.Screen name="LogExercise" component={LogExerciseScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="BarcodeScan" component={BarcodeScanScreen} />
      <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen} />
      <Stack.Screen name="MealPlan" component={MealPlanScreen} />
      <Stack.Screen name="GroceryList" component={GroceryListScreen} />
      <Stack.Screen name="Coach" component={CoachScreen} />
      <Stack.Screen name="HealthTracks" component={HealthTracksScreen} />
      <Stack.Screen name="HealthTrackDetail" component={HealthTrackDetailScreen} />
      <Stack.Screen name="Programs" component={ProgramsScreen} />
      <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
      <Stack.Screen name="FeaturesHub" component={FeaturesHubScreen} />
    </Stack.Navigator>
  );
}
