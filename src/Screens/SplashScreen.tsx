import React, { useEffect, useRef } from 'react';
import { View, Image, StatusBar, ImageBackground } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { styles } from '../style/SplashStyles';

const LOGO = require('../icons/mainlogo.png');          // Center logo
const BG_IMAGE = require('../icons/background.png');    // Background image

type SplashScreenProps = { navigation: StackNavigationProp<any, any> };

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  const navigatedRef = useRef(false);

  const goNext = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  useEffect(() => {
    const t = setTimeout(goNext, 3000); // 3 seconds
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden translucent />
      <ImageBackground source={BG_IMAGE} style={styles.container}>
        <View style={styles.centerBox}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>
      </ImageBackground>
    </View>
  );
};

export default SplashScreen;
