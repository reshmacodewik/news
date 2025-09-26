import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageSourcePropType,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../style/PricingStyles';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;
const LOGO   = require('../../icons/logoblack.png');
const AVATAR = require('../../icons/user.png');
const CHECK  = require('../../icons/checkBlue.png'); // small check/verified icon
const DOT    = require('../../icons/dot.png');    // small grey bullet/gear

type Feature = { text: string; icon?: ImageSourcePropType };
type Plan = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  cadence: string;
  features: Feature[];
  cta: string;
  highlight?: boolean; // adds blue border + ribbon
};

const PLANS: Plan[] = [
  {
    id: 'standard',
    title: 'Standard Plan',
    subtitle: 'For readers who want more depth.',
    price: '$10',
    cadence: '/monthly',
    cta: 'Subscribe Now',
    highlight: true,
    features: [
      { text: 'Unlimited article access', icon: CHECK },
      { text: 'Ad–free reading experience', icon: DOT },
      { text: 'Early access to exclusive stories', icon: DOT },
      { text: 'Personalize your feed', icon: DOT },
      { text: 'Download articles for offline reading', icon: DOT },
    ],
  },
  {
    id: 'premium',
    title: 'Premium Plan',
    subtitle: 'For fast-growing businesses',
    price: '$20',
    cadence: '/monthly',
    cta: 'Go Premium',
    features: [
      { text: 'All Standard Plan features +', icon: CHECK },
      { text: 'Priority newsletter content', icon: DOT },
      { text: 'Advanced reading analytics', icon: DOT },
      { text: 'Custom topic alerts', icon: DOT },
      { text: 'Compliance tools', icon: DOT },
    ],
  },
  {
    id: 'free',
    title: 'Free Plan (Starter)',
    subtitle: 'Stay informed with basic access.',
    price: 'Free',
    cadence: '',
    cta: 'Try for free',
    features: [
      { text: 'Limited daily article reads', icon: DOT },
      { text: 'Breaking news alerts', icon: DOT },
      { text: 'Access to newsletters', icon: DOT },
      { text: 'Basic analytics dashboard', icon: DOT },
      { text: '1,000 API calls per month', icon: DOT },
    ],
  },
];

const PricingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Safe top space */}
      <View style={{ height: insets.top }} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <View style={styles.avatarWrap}>
          <Image source={AVATAR} style={styles.avatar} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(28) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>All Trending News</Text>

        {PLANS.map((plan, idx) => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              plan.highlight && styles.planCardHighlight,
              idx === 0 ? { marginTop: scale(8) } : null,
            ]}
          >
            {plan.highlight && (
              <View style={styles.ribbon}>
                <Text style={styles.ribbonText}>MOST POPULAR PLAN</Text>
              </View>
            )}

            <View style={styles.innerCard}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <Text style={styles.planSubtitle}>{plan.subtitle}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.cadence}>{plan.cadence}</Text>
              </View>

              {/* Features */}
              <View style={{ marginTop: scale(8) }}>
                {plan.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    {!!f.icon && (
                      <Image
                        source={f.icon}
                        style={[
                          styles.featureIcon,
                          f.icon === CHECK ? styles.featureIconBlue : null,
                        ]}
                      />
                    )}
                    <Text
                      style={[
                        styles.featureText,
                        f.icon === CHECK ? styles.featureTextBold : null,
                      ]}
                    >
                      {f.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* CTA */}
              <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.9}>
                <Text style={styles.ctaText}>{plan.cta}</Text>
              </TouchableOpacity>

              {/* Small “contact sales” link under Standard (to match mock) */}
              {plan.id === 'standard' && (
                <Text style={styles.underLink}>
                  or <Text style={styles.link}>contact sales</Text>
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default PricingScreen;
