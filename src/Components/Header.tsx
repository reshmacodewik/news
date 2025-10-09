import React, { useMemo, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import { useAuth } from '../Screens/Auth/AuthContext';
import { navigate } from '../Navigators/utils';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../Utils/api/common';
import { API_GET_PROFILE } from '../Utils/api/APIConstant';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

type HeaderProps = {
  logoSource: ImageSourcePropType;
  /** Fallback avatar image (local require) */
  avatarSource: ImageSourcePropType;
  /** Optional override for the profile endpoint */
  profileEndpoint?: string;
  barStyle?: 'light-content' | 'dark-content';
  guestRoute?: string;
  authRoute?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({
  logoSource,
  avatarSource,
  profileEndpoint,
  barStyle = 'dark-content',
  guestRoute = 'More',
  authRoute = 'More',
  leftSlot,
  rightSlot,
}) => {
  const { session } = useAuth();
  const [avatarErrored, setAvatarErrored] = useState(false);

  const endpoint =  API_GET_PROFILE;

  // Fetch profile only when logged in
  const { data: profile } = useQuery({
    queryKey: ['profile-info'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: endpoint });
      return res?.data?.data ?? res?.data ?? {};
    },
    enabled: Boolean(session?.accessToken),
    staleTime: 60_000,
  });

  const resolvedAvatarSource = useMemo(() => {
    if (avatarErrored) return avatarSource;
    const photo: string | undefined = profile?.photo;
    if (photo && /^https?:\/\//i.test(photo)) return { uri: photo };
    return avatarSource;
  }, [profile?.photo, avatarErrored, avatarSource]);

  const handleAvatarPress = () => {
    const route = session?.accessToken ? authRoute : guestRoute;
    navigate(route as never);
  };

  return (
    <View style={styles.header}>
      <StatusBar translucent barStyle={barStyle} />
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {leftSlot ?? (
            <Image source={logoSource} style={styles.logo} resizeMode="contain" />
          )}
        </View>

        <View style={styles.rightRow}>
          {rightSlot}
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={handleAvatarPress}
            activeOpacity={0.8}
          >
            <Image
              source={resolvedAvatarSource as any}
              style={styles.avatar}
              onError={() => setAvatarErrored(true)}
            />
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
