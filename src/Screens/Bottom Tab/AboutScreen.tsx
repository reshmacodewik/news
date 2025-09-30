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
import { getApiWithOutQuery } from '../../Utils/api/common';
import { styles } from '../../style/AboutStyles';
import { API_ABOUT_US } from '../../Utils/api/APIConstant';

const BG = require('../../icons/backgroundnew.png');
const LOGO = require('../../icons/headerlogo.png');
const AVATAR = require('../../icons/user.png');

const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Fetch About Us content from API
  const { data, isLoading, isError } = useQuery({
    queryKey: ['about-us'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({
        url: API_ABOUT_US,
      });
      console.log('About Us Data:', res.data);
      return res.data; // 👈 returns { _id, slug, description, ... }
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar translucent barStyle="light-content" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={BG}
          style={[styles.header, { paddingTop: insets.top }]}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay} />
          <View style={styles.topBar}>
            <Image source={LOGO} style={styles.logo} />
            <View style={styles.avatarWrap}>
              <Image source={AVATAR} style={styles.avatar} />
            </View>
          </View>
        </ImageBackground>

        {/* CONTENT */}
        <View style={styles.sheet}>
          <Text style={styles.h1}>About Us</Text>
          <Text style={styles.body}>
            {data?.description || 'No content available.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default AboutScreen;
