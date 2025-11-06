import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuth } from '../Screens/Auth/AuthContext';
import { navigate } from '../Navigators/utils';
import { getApiWithOutQuery } from '../Utils/api/common';
import { API_GET_PROFILE } from '../Utils/api/APIConstant';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;
const { width } = Dimensions.get('window');
const isTablet =
  (Platform.OS === 'ios' && (Platform as any).isPad) || width >= 768;

// helper: keep phone exactly as-is, but don't scale up on iPad
const padH = isTablet ? 22 : scale(16);
const logoW = isTablet ? 300 : scale(155);
const logoH = isTablet ? 45 : scale(28);
const headerPadTop = isTablet ? scale(15) : scale(10);
const avatarSize = isTablet ? 50 : scale(34);
type HeaderProps = {
  logoSource: ImageSourcePropType;
  avatarSource: ImageSourcePropType;
  barStyle?: 'light-content' | 'dark-content';
  guestRoute?: string;
  authRoute?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  isHome?: boolean; 
};

const Header: React.FC<HeaderProps> = ({
  logoSource,
  avatarSource,
  barStyle = 'light-content',
  guestRoute = 'More',
  authRoute = 'More',
  leftSlot,
  rightSlot,
  isHome = false, 
}) => {
  const { session } = useAuth();
  const [avatarErrored, setAvatarErrored] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { theme, colors } = useTheme();

  // Default avatar if no profile photo
  const AVATAR = require('../icons/user.png');

  // Fetch profile photo
  const fetchProfile = async () => {
    if (!session?.accessToken) return;
    setIsLoading(true);
    try {
      const res = await getApiWithOutQuery({ url: API_GET_PROFILE });
      setProfilePhoto(res?.data?.photo ?? null);
    } catch (err) {
      console.log('Failed to fetch profile', err);
      setProfilePhoto(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) fetchProfile();
  }, [session?.accessToken]);

  useFocusEffect(
    useCallback(() => {
      if (session?.accessToken) fetchProfile();
    }, [session?.accessToken])
  );

  const handleAvatarPress = () => {
    const route = session?.accessToken ? authRoute : guestRoute;
    navigate(route as never);
  };

  const avatarSourceUri =
    profilePhoto && !avatarErrored ? { uri: profilePhoto } : AVATAR;

  // ✅ Dynamic tint color (white in dark mode, black in light mode)
 // ✅ White logo on Home screen (even in light mode)
const tintColor =
  theme === 'dark'
    ? '#fff'
    : isHome
    ? '#fff' // 👈 make white if Home and light mode
    : '#000';


  return (
    <View style={[styles.header]}>
      <StatusBar translucent barStyle={barStyle} />
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {leftSlot ?? (
            <Image
              source={logoSource}
              style={[styles.logo, { tintColor }]} // 👈 logo adapts to mode
              resizeMode="contain"
            />
          )}
        </View>

        <View style={styles.rightRow}>
          {rightSlot}
          <TouchableOpacity
            style={[
              styles.avatarBtn,
              { backgroundColor: theme === 'dark' ? '#333' : '#F0F4FF' },
            ]}
            onPress={handleAvatarPress}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={tintColor} />
            ) : (
              <Image
                source={avatarSourceUri}
                style={[styles.avatar]} // 👈 apply tint only for default avatar
                onError={() => setAvatarErrored(true)}
                resizeMode="cover"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({

  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
   header: {
    width: '100%',
    paddingBottom: scale(16),
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
    overflow: 'hidden',
    paddingTop: headerPadTop,        // ⬅️ was scale(10)
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: padH,         // ⬅️ clamp on iPad
    justifyContent: 'space-between',
  },
  logo: { width: logoW, height: logoH }, // ⬅️ smaller on iPad so it doesn’t push
  avatarBtn: {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: isTablet ? 10 : scale(12),
  },
  avatar: { width: '100%', height: '100%' },
});

export default Header;
