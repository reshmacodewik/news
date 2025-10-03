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
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import { styles } from '../../style/PricingStyles';
import { API_SUBSCRIPTION_PLANS } from '../../Utils/api/APIConstant';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

const LOGO = require('../../icons/logoblack.png');
const AVATAR = require('../../icons/user.png');
const CHECK = require('../../icons/checkBlue.png');
const DOT = require('../../icons/dot.png');

type Plan = {
  _id: string;
  name: string;
  description: string;
  price: { monthly: number; yearly: number };
  features: string[];
  highlight?: boolean;
};

const PricingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const selectedCadence: 'monthly' | 'yearly' = 'monthly';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_SUBSCRIPTION_PLANS });
      return res.data as Plan[];
    },
  });

  // Compute most expensive plan based on selectedCadence
  const mostExpensive =
    Array.isArray(data) && data.length
      ? data.reduce(
          (prev, curr) =>
            curr.price[selectedCadence] > prev.price[selectedCadence]
              ? curr
              : prev,
          data[0]
        )
      : null;

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top }} />

      {/* Top Bar */}
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
        <Text style={styles.pageTitle}>Subscription Plans</Text>

        {Array.isArray(data) && data.length > 0 ? (
          data.map((plan, idx) => {
            const isMostPopular = plan._id === mostExpensive?._id;

            return (
              <View
                key={plan._id}
                style={[
                  styles.planCard,
                  plan.highlight && styles.planCardHighlight,
                  isMostPopular && { borderColor: '#2260B2', borderWidth: 3 },
                ]}
              >
                {/* Ribbon */}
                {isMostPopular && (
                  <View style={styles.ribbon}>
                    <Text style={styles.ribbonText}>MOST POPULAR PLAN</Text>
                  </View>
                )}

                <View style={styles.innerCard}>
                  {/* Title */}
                  <Text style={styles.planTitle}>{plan.name}</Text>
                  <Text style={styles.planSubtitle}>{plan.description}</Text>

                  {/* Price */}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      ${plan.price[selectedCadence] ?? 0}
                    </Text>
                    <Text style={styles.cadence}>/{selectedCadence}</Text>
                  </View>

                  {/* Features */}
                  <View style={{ marginTop: scale(12) }}>
                    {plan.features.map((feature, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Image
                          source={i === 0 ? CHECK : DOT}
                          style={[
                            styles.featureIcon,
                            i === 0 && styles.featureIconBlue,
                          ]}
                        />
                        <Text
                          style={[
                            styles.featureText,
                            i === 0 && styles.featureTextBold,
                          ]}
                        >
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Subscribe Button */}
                  <TouchableOpacity
                    style={[
                      styles.ctaBtn,
                      isMostPopular && { backgroundColor: '#333333' },
                    ]}
                    activeOpacity={0.9}
                  >
                    <Text
                      style={[
                        styles.ctaText,
                        isMostPopular && { color: '#fff' },
                      ]}
                    >
                      Subscribe Now
                    </Text>
                  </TouchableOpacity>

                  {/* <Text >
                    or <Text >contact sales</Text>
                  </Text> */}
                </View>
              </View>
            );
          })
        ) : !isLoading ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No plans available.
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default PricingScreen;
