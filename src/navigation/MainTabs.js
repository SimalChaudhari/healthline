import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, BookOpen, Compass, ChartLine, Menu } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { themeColors, colors } from '../config/colors';
import { snPro } from '../config/fonts';
import DashboardScreen from '../screens/DashboardScreen';
import DiaryScreen from '../screens/DiaryScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProgressScreen from '../screens/ProgressScreen';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Dashboard', label: 'Home', Icon: LayoutDashboard, component: DashboardScreen },
  { name: 'Diary', label: 'Diary', Icon: BookOpen, component: DiaryScreen },
  { name: 'Discover', label: 'Discover', Icon: Compass, component: DiscoverScreen },
  { name: 'Progress', label: 'Progress', Icon: ChartLine, component: ProgressScreen },
  { name: 'More', label: 'More', Icon: Menu, component: MoreScreen },
];

function CustomTabBar({ state, descriptors, navigation }) {
  const { isDark } = useTheme();
  const c = themeColors(isDark);
  const insets = useSafeAreaInsets();

  // Explicit padding on all sides — not top-only
  const padTop = 10;
  const padBottom = Math.max(insets.bottom, 12);
  const padX = 6;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: c.cardBg,
          borderTopColor: c.border,
          paddingTop: padTop,
          paddingBottom: padBottom,
          paddingLeft: padX,
          paddingRight: padX,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const meta = TABS.find((t) => t.name === route.name) || TABS[index];
        const label = meta?.label || options.title || route.name;
        const Icon = meta?.Icon || LayoutDashboard;
        const color = focused ? colors.primary : c.muted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Icon size={20} color={color} strokeWidth={focused ? 2.4 : 2} />
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              style={[
                styles.label,
                {
                  color,
                  fontFamily: snPro('600'),
                },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TABS.map(({ name, component }) => (
        <Tab.Screen key={name} name={name} component={component} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    // height is content-driven (pad top + icons + label + pad bottom)
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  itemPressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    includeFontPadding: false,
    fontWeight: 'normal',
    width: '100%',
  },
});
