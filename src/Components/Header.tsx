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
} from 'react-native';
import { useAuth } from '../Screens/Auth/AuthContext';
import { navigate } from '../Navigators/utils';
import { getApiWithOutQuery } from '../Utils/api/common';
import { API_GET_PROFILE } from '../Utils/api/APIConstant';
import { useFocusEffect } from '@react-navigation/native';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

type HeaderProps = {
  logoSource: ImageSourcePropType;
  avatarSource: ImageSourcePropType;
  barStyle?: 'light-content' | 'dark-content';
  guestRoute?: string;
  authRoute?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({
  logoSource,
  avatarSource,
  barStyle = 'dark-content',
  guestRoute = 'More',
  authRoute = 'More',
  leftSlot,
  rightSlot,
}) => {
  const { session } = useAuth();
  const [avatarErrored, setAvatarErrored] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Default avatar if no profile photo is available
  const AVATAR = require('../icons/user.png');

  // Fetch profile photo if authenticated
  useEffect(() => {
    if (session?.accessToken) {
      fetchProfile();
    }
  }, [session?.accessToken]);

  useFocusEffect(
    useCallback(() => {
      if (session?.accessToken) {
        fetchProfile();
      }
    }, [session?.accessToken]),
  );

  // Define fetchProfile outside so both effects can access it:
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

  const handleAvatarPress = () => {
    const route = session?.accessToken ? authRoute : guestRoute;
    navigate(route as never);
  };

  // If avatar image fails, use default avatar
  const avatarSourceUri =
    profilePhoto && !avatarErrored ? { uri: profilePhoto } : AVATAR;

  return (
    <View style={styles.header}>
      <StatusBar translucent barStyle={barStyle} />
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {leftSlot ?? (
            <Image
              source={logoSource}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
        </View>

        <View style={styles.rightRow}>
          {rightSlot}
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={handleAvatarPress}
            activeOpacity={0.8}
          >
            {isLoading ? (
              // Show a loading spinner while fetching the profile image
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Image
                source={avatarSourceUri}
                style={styles.avatar}
                onError={() => setAvatarErrored(true)} // Mark as errored if the image fails
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingBottom: scale(16),
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
    overflow: 'hidden',
    paddingTop: scale(10),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    justifyContent: 'space-between',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: { width: scale(155), height: scale(28) },
  avatarBtn: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: scale(12),
  },
  avatar: { width: '100%', height: '100%' },
});

export default Header;
