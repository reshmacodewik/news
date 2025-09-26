import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../style/PrivacyPolicyStyles';
import { navigate } from '../Navigators/utils';


const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

// Replace with your actual logo asset
const LOGO = require('../icons/Blacklogo.png');
const BACK_ARROW = require('../icons/back.png'); // Add this icon to your assets

const PrivacyPolicyScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    navigate('Home'); // Replace 'Home' with your actual previous screen name
    console.log('Back pressed');
  };

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top }} />
      
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Image source={BACK_ARROW} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + scale(32) 
        }}
      >
        {/* Logo and Brand Section */}
        <View style={styles.brandSection}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
         
        </View>

        {/* Main Heading */}
        <View style={styles.headerSection}>
          <Text style={styles.mainHeading}>Privacy Policy</Text>
          <Text style={styles.lastUpdate}>Last update: January 1, 2025</Text>
        </View>

        {/* Introduction Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Introduction</Text>
          <Text style={styles.bodyText}>
            At Arcalis News, your privacy is our top priority. This privacy policy explains the types of information we collect, how we use it, and the measures we take to protect your personal data. We aim to provide transparency about our practices and build trust with our readers. Whether you browse our articles, subscribe to our newsletter, or leave comments, we handle your information responsibly and securely. By visiting our site, you consent to our policies. Our goal is to create a safe online environment where you can access news, updates, and personalized content without worrying about unauthorized data use. Your trust matters to us.
          </Text>
        </View>

        {/* Our Values Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Our Values</Text>
          <Text style={styles.bodyText}>
            We are committed to transparency and giving users control over their data. Protecting your privacy is fundamental to our mission. We only collect information that is essential for providing our services and improving your experience. Your personal information is never sold to third parties, and we maintain strict internal policies to safeguard it. We ensure that you can manage preferences, access data, and opt out when desired. Our team continuously reviews privacy practices to stay compliant with legal requirements and industry standards. By prioritizing user privacy, we strive to create a trustworthy platform where readers feel confident interacting with our content.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicyScreen;
