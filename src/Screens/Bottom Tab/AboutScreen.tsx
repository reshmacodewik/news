import React from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import { styles } from '../../style/AboutStyles';
import { API_ABOUT_US } from '../../Utils/api/APIConstant';
import Header from '../../Components/Header';
import { useTheme } from '../../context/ThemeContext';

const BG = require('../../icons/backgroundnew.png');
const LOGO = require('../../icons/headerlogo.png');
const AVATAR = require('../../icons/user.png');

const AboutScreen: React.FC = () => {
  const TAB_BAR_HEIGHT = 100; // adjust to your tab's height
  const insets = useSafeAreaInsets();
   const { theme, colors } = useTheme();
  const scale = (size: number) => (Dimensions.get('window').width / 375) * size;
  const { data, isLoading, isError } = useQuery({
    queryKey: ['about-us'],
    queryFn: async () => {
      try {
        const res = await getApiWithOutQuery({
          url: API_ABOUT_US,
        });

        if (res?.data) {
          return res.data;
        }
        console.log(res.data, 'res');
        return {}; // return empty object instead of undefined
      } catch (error) {
        console.error('About Us API error:', error);
        return {}; // fallback so query data is never undefined
      }
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
       bounces={false}
        alwaysBounceVertical={false}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + TAB_BAR_HEIGHT, // ✅ enough room below
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom + TAB_BAR_HEIGHT }} // nicer indicator position
      >
        <ImageBackground
          source={BG}
          style={[styles.header, { paddingTop: insets.top }]}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <Header
            logoSource={LOGO}
            avatarSource={AVATAR}
            guestRoute="More"
            authRoute="More"
          />
        </ImageBackground>

        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <Text style={[styles.h1,   { color: theme === 'dark' ? colors.headingtext : '#000000' },]}>About Us</Text>
          <Text style={[styles.body, { color: colors.text }]}>
            {(
              data?.data?.description ??
              data?.description ??
              'No content available.'
            )
              // normalize line breaks just in case
              .replace(/\r\n/g, '\n')}
          </Text>
        </View>

        {/* Optional explicit spacer if you prefer */}
        {/* <View style={{ height: insets.bottom + TAB_BAR_HEIGHT }} /> */}
      </ScrollView>
    </View>
  );
};

export default AboutScreen;
