import React from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../Utils/api/common';
import { styles } from '../style/AboutStyles';
import { API_TERMS_AND_CONDITIONS } from '../Utils/api/APIConstant';
import Header from '../Components/Header';

const BG = require('../icons/backgroundnew.png');
const LOGO = require('../icons/headerlogo.png');
const AVATAR = require('../icons/user.png');

const TermsAndConditionsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['terms-and-conditions'],
    queryFn: async () => {
      try {
        const res = await getApiWithOutQuery({
          url: API_TERMS_AND_CONDITIONS,
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
    <View style={styles.container}>
      <StatusBar translucent barStyle="light-content" />

      <ScrollView
        bounces={false}
        alwaysBounceVertical={false}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={BG}
          style={[styles.header, { paddingTop: insets.top }]}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <Header logoSource={LOGO} avatarSource={AVATAR} />
        </ImageBackground>

        {/* CONTENT */}
        <View style={styles.sheet}>
          <Text style={styles.h1}>Terms & Conditions</Text>
          <Text style={styles.body}>
            {data?.description || 'No content available.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default TermsAndConditionsScreen;
