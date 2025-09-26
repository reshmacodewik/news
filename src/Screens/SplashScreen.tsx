import React, { useEffect, useRef } from 'react';
import { View, Image, StatusBar } from 'react-native';
import Video from 'react-native-video';
import type { StackNavigationProp } from '@react-navigation/stack';
import { styles } from '../style/SplashStyles';

const LOGO = require('../icons/mainlogo.png');          // optional overlay
const VIDEO = require('../Video/splash.mp4');          // <— local mp4

type SplashScreenProps = { navigation: StackNavigationProp<any, any> };

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  const navigatedRef = useRef(false);

  const goNext = () => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  useEffect(() => {
    const t = setTimeout(goNext, 6000); // safety in case onEnd never fires
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden translucent />
      <Video
        source={VIDEO}
        style={styles.video}              // full-screen
        resizeMode="cover"
        muted={false}
        repeat={false}
        paused={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="obey"
        onEnd={goNext}
        onError={(e) => {
          console.warn('Splash video error:', e);
          goNext();
        }}
      />

      {/* Optional center logo overlay — delete if you don't want it */}
      {/* <View style={styles.centerBox}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View> */}
    </View>
  );
};

export default SplashScreen;
