import React from 'react';
import { View, Text, Image, ImageBackground, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles, scale, HEADER_H, SHEET_OVERLAP } from '../../style/AboutStyles';

const BG     = require('../../icons/backgroundnew.png');
const LOGO   = require('../../icons/headerlogo.png');
const AVATAR = require('../../icons/user.png');

const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar translucent barStyle="light-content" />

     <ScrollView
        style={styles.scroll}
        
        showsVerticalScrollIndicator={false}
      >
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

      {/* CONTENT (scrolls) */}
     
      <View style={styles.sheet}>
          <Text style={styles.h1}>About Us</Text>

          <Text style={styles.body}>
            Arcalis News is dedicated to delivering truthful, timely, and unbiased reporting in
            today’s fast-paced digital world, where misinformation spreads rapidly. Founded in 2023,
            we are an independent platform covering diverse topics such as world events, politics,
            business, health, technology, lifestyle, and the environment.
          </Text>

          <Text style={styles.body}>
            Our mission is to go beyond headlines, providing fact-checked stories, in-depth
            analysis, and expert insights on issues that matter most. We believe journalism is a
            two-way conversation and value reader engagement. Join our community to stay informed
            with clear, reliable, and transparent news that empowers smarter decisions and deeper
            global understanding.
          </Text>

          <Text style={styles.body}>
            Our mission is to go beyond headlines, providing fact-checked stories, in-depth
            analysis, and expert insights on issues that matter most. We believe journalism is a
            two-way conversation and value reader engagement. Join our community to stay informed
            with clear, reliable, and transparent news that empowers smarter decisions and deeper
            global understanding.
          </Text>
        </View>
      
        {/* FLOATING CARD that overlaps header */}
        
      </ScrollView>
    </View>
  );
};

export default AboutScreen;
