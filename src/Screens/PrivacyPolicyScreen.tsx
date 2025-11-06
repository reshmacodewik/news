import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../Utils/api/common';
import { styles } from '../style/PrivacyPolicyStyles';
import { goBackNavigation, navigate } from '../Navigators/utils';
import { API_PRIVACY_POLICY } from '../Utils/api/APIConstant';
import { useTheme } from '../context/ThemeContext';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;
const LOGO = require('../icons/Blacklogo.png');
const BACK_ARROW = require('../icons/back.png');

const PrivacyPolicyScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [lastUpdate, setLastUpdate] = useState('');
  const formatTitle = (text: string) =>
    text
      ?.replace(/-/g, ' ')
      ?.split(' ')
      ?.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      ?.join(' ');
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleBackPress = () => {
    goBackNavigation();
  };
  const { theme, colors } = useTheme();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cms-privacy-policy'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_PRIVACY_POLICY });
      return res?.data ?? { sections: [], slug: '', updatedAt: '' };
    },
  });

  useEffect(() => {
    if (data?.updatedAt) {
      const date = new Date(data.updatedAt);
      setLastUpdate(date.toLocaleDateString());
    }
  }, [data]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text>Error loading content.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ height: insets.top }} />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Image
            source={BACK_ARROW}
            style={[styles.backIcon, { tintColor: colors.text }]}
          />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]}>
          Privacy Policy
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(32) }}
      >
        {/* Logo Section */}
        <View style={styles.brandSection}>
          <Image
            source={LOGO}
            style={[styles.logo, { tintColor: colors.text }]}
            resizeMode="contain"
          />
        </View>

        {/* Main Heading */}
        <View
          style={[styles.headerSection, { backgroundColor: colors.background }]}
        >
          <Text style={[styles.mainHeading, { color: colors.text }]}>
            {data?.slug ? formatTitle(data.slug) : 'Privacy Policy'}
          </Text>
          {lastUpdate ? (
            <Text style={styles.lastUpdate}> Last update: {formatDate(data?.updatedAt || '2025-11-23')}</Text>
          ) : null}
        </View>

        {/* Sections from API */}
        {data?.sections?.length ? (
          data.sections.map((section: any, index: number) => (
            <View key={index} style={styles.section}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>
                {section.title}
              </Text>
              <Text style={[styles.bodyText, { color: colors.text }]}>
                {section.description}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No content available.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicyScreen;
