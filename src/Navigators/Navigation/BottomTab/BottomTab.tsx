// Navigation/BottomTab.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SCREEN_NAMES } from '../../../Utils/Constant/constant';

const Tab = createBottomTabNavigator();
import { Image } from 'react-native';
import HomeScreen from '../../../Screens/Home/HomeScreen';
import AboutScreen from '../../../Screens/Bottom Tab/AboutScreen';
import TrendingScreen from '../../../Screens/Bottom Tab/TrendingScreen';
import MoreScreen from '../../../Screens/Bottom Tab/MoreScreen';
import PricingScreen from '../../../Screens/Bottom Tab/PricingScreen';
import CryptoScreen from '../../../Screens/Bottom Tab/CryptoScreen';
import { useTheme } from '../../../context/ThemeContext';

type IconPair = {
  inactive: any;
  active: any;
};

const ICONS: Record<string, IconPair> = {
  [SCREEN_NAMES.home]: {
    inactive: require('../../../icons/Home.png'),
    active: require('../../../icons/Home-outline.png'),
  },
  [SCREEN_NAMES.about]: {
    inactive: require('../../../icons/About.png'),
    active: require('../../../icons/About-outline.png'),
  },
  [SCREEN_NAMES.trending]: {
    inactive: require('../../../icons/Trending.png'),
    active: require('../../../icons/Trending-outline.png'),
  },
  [SCREEN_NAMES.subscription]: {
    inactive: require('../../../icons/sub.png'),
    active: require('../../../icons/sub-outline.png'),
  },
  [SCREEN_NAMES.crypto]: {
    inactive: require('../../../icons/crypto.png'),
    active: require('../../../icons/crypto_fill.png'),
  },
};

const ICON_SIZE = 26; // 26–28 looks right
const PILL_HPAD = 12; // horizontal padding to make a rounded “capsule”


export default function BottomTab() {
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();
  const iconFor = (route: string, active: boolean) => {
  const pair = ICONS[route] ?? ICONS[SCREEN_NAMES.more];
  const src = active ? pair.active : pair.inactive;

  return (
    <View style={s.iconHitArea}>
      <Image
        source={src}
        style={{ width: ICON_SIZE, height: ICON_SIZE, resizeMode: 'contain', tintColor: active ? colors.headingtext : colors.text }}
      />
    </View>
  );
};

  return (
    <Tab.Navigator
      initialRouteName={SCREEN_NAMES.home}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 78 : 66,
          backgroundColor: colors.card,
        },
      }}
      tabBar={props => {
        const { state, navigation } = props;
        return (
          <View
            style={[
              s.tabBar,
              {
                backgroundColor: colors.card,
                paddingBottom: Math.max(insets.bottom, 8),
                borderTopColor: theme === 'dark' ? '#222' : '#E5E7EB',
              },
            ]}
          >
            {state.routes.map((route, index) => {
              const active = state.index === index;
              const label = route.name;
              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(route.name as never)}
                  style={s.tabItem}
                >
                  <View style={[s.iconWrap, active && s.iconWrapActive]}>
                    {iconFor(route.name, active)}
                  </View>
                  <Text
                    style={[
                      s.tabLabel,
                      active && s.tabLabelActive,
                      { color: colors.text },
                      active && { color: colors.headingtext },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {/* subtle iOS-like home indicator bar */}
            <View style={s.homeIndicator} />
          </View>
        );
      }}
    >
      <Tab.Screen name={SCREEN_NAMES.home} component={HomeScreen} />
      <Tab.Screen name={SCREEN_NAMES.about} component={AboutScreen} />
      <Tab.Screen name={SCREEN_NAMES.trending} component={TrendingScreen} />
      <Tab.Screen name={SCREEN_NAMES.crypto} component={CryptoScreen} />
      <Tab.Screen name={SCREEN_NAMES.subscription} component={PricingScreen} />
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 4, flex: 1 },

  iconHitArea: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    borderRadius: 999,
    paddingVertical: 12, // base small padding
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(34,96,178,0.15)', // #2260B2 with alpha
    paddingVertical: 10,
    borderRadius: 80,
    paddingHorizontal: 11,
  },
  tabLabel: { fontSize: 12, color: '#6B7280' },
  tabLabelActive: { color: '#2260B2', fontWeight: '700' },
  homeIndicator: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    width: 80,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
});
