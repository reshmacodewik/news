// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Dimensions,
//   ActivityIndicator,
//   Alert,
//   Linking,
//   AppState,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useQuery } from '@tanstack/react-query';
// import { getApiWithOutQuery } from '../../Utils/api/common';
// import { API_SUBSCRIPTION_PLANS } from '../../Utils/api/APIConstant';
// import Header from '../../Components/Header';
// import { navigate } from '../../Navigators/utils';
// import { styles } from '../../style/PricingStyles';
// import { useAuth } from '../Auth/AuthContext';
// import PaymentStatusModal from '../../Components/PaymentStatusModal';

// const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

// const LOGO = require('../../icons/logoblack.png');
// const AVATAR = require('../../icons/user.png');
// const CHECK = require('../../icons/checkBlue.png');
// const DOT = require('../../icons/dot.png');

// const PricingScreen: React.FC = () => {
//   const [selectedCadence, setSelectedCadence] = useState<'weekly' | 'monthly' | 'annual'>('monthly');
//   const insets = useSafeAreaInsets();
//   const { session } = useAuth();

//   const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [transactionId, setTransactionId] = useState<string | null>(null);
//   const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

//   // ✅ Fetch subscription plans
//   const { data, isLoading } = useQuery({
//     queryKey: ['subscription-plans'],
//     queryFn: async () => {
//       const res = await getApiWithOutQuery({ url: API_SUBSCRIPTION_PLANS });
//       return res.data;
//     },
//   });

//   // ✅ Determine most expensive plan for highlighting
//   const mostExpensive =
//     Array.isArray(data) && data.length
//       ? data.reduce((prev, curr) =>
//           curr.price?.[selectedCadence] > prev.price?.[selectedCadence] ? curr : prev,
//         )
//       : null;

//   const handleSubscribe = async (planId: string) => {
//     try {
//       const billingCycle = selectedCadence;
//       const userId =
//         (session as any)?.user?.id ||
//         (session as any)?.user?._id ||
//         (session as any)?.user?.userId;
//       const token = session?.accessToken;

//       if (!token || !userId) {
//         Alert.alert('Please log in', 'You need to log in to subscribe to a plan.', [
//           { text: 'Cancel', style: 'cancel' },
//           { text: 'Login', onPress: () => navigate('Login', {} as any) },
//         ]);
//         return;
//       }

//       setLoadingPlan(planId);

//       const res = await fetch(`https://api.arcalisnews.com/api/billing/create-checkout`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ planId, userId, billingCycle }),
//       });

//       const json = await res.json();

//       if (!res.ok || !json?.data?.checkoutUrl) {
//         throw new Error(json?.error || 'Failed to create checkout');
//       }

//       let url = String(json.data.checkoutUrl || '').trim();
//       const trxId = json.data.transactionId;

//       if (!/^https?:\/\//i.test(url)) {
//         url = `https://${url}`;
//       }

//       const supported = await Linking.canOpenURL(url);
//       if (supported) {
//         await Linking.openURL(url);
//         setTransactionId(trxId);
//         setShowStatusModal(true);
//       }
//     } catch (e) {
//       console.error('Error creating checkout:', e);
//     } finally {
//       setLoadingPlan(null);
//     }
//   };

//   // ✅ App state listener — check payment on resume
//   const appState = useRef(AppState.currentState);
//   useEffect(() => {
//     const subscription = AppState.addEventListener('change', async nextAppState => {
//       if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
//         if (transactionId) {
//           try {
//             const res = await fetch(
//               `https://api.arcalisnews.com/api/billing/billing-check/${transactionId}`,
//             );
//             const json = await res.json();
//             const status = json?.data?.paymentStatus;

//             if (status === 'completed') setPaymentStatus('completed');
//             else if (status === 'failed') setPaymentStatus('failed');
//             else setPaymentStatus('pending');
//           } catch (err) {
//             console.error('Error checking payment:', err);
//           }
//         }
//       }
//       appState.current = nextAppState;
//     });
//     return () => subscription.remove();
//   }, [transactionId]);

//   // ✅ normalize "annual" → "yearly" for backend keys
//   const getCadenceKey = (cadence: string) =>
//     cadence === 'annual' ? 'yearly' : cadence;

//   return (
//     <View style={styles.container}>
//       <View style={{ height: insets.top }} />
//       <Header logoSource={LOGO} avatarSource={AVATAR} guestRoute="More" authRoute="More" />

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={{ paddingBottom: insets.bottom + scale(28) }}
//         showsVerticalScrollIndicator={false}
//       >
//         <Text style={styles.pageTitle}>Subscription Plans</Text>

//         {/* Billing cycle toggle */}
//         <View style={styles.toggleContainer}>
//           {['weekly', 'monthly', 'annual'].map(cadence => (
//             <TouchableOpacity
//               key={cadence}
//               style={[
//                 styles.toggleButton,
//                 selectedCadence === cadence && styles.toggleButtonActive,
//               ]}
//               onPress={() => setSelectedCadence(cadence as any)}
//             >
//               <Text
//                 style={[
//                   styles.toggleText,
//                   selectedCadence === cadence && styles.toggleTextActive,
//                 ]}
//               >
//                 {cadence.charAt(0).toUpperCase() + cadence.slice(1)}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {selectedCadence === 'annual' && (
//           <Text style={styles.discountText}>🎉 Save 15% with annual subscription</Text>
//         )}

//         {isLoading ? (
//           <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#2260B2" />
//         ) : Array.isArray(data) && data.length > 0 ? (
//           data.map(plan => {
//             const cadenceKey = getCadenceKey(selectedCadence); // convert "annual" → "yearly"

//             const description =
//               plan.description?.[cadenceKey] || 'No description available';

//             const features =
//               Array.isArray(plan.features?.[cadenceKey])
//                 ? plan.features[cadenceKey]
//                 : [];

//             const isMostPopular = plan._id === mostExpensive?._id;

//             return (
//               <View
//                 key={plan._id}
//                 style={[
//                   styles.planCard,
//                   plan.highlight && styles.planCardHighlight,
//                   isMostPopular && { borderColor: '#2260B2', borderWidth: 3 },
//                 ]}
//               >
//                 {isMostPopular && (
//                   <View style={styles.ribbon}>
//                     <Text style={styles.ribbonText}>MOST POPULAR PLAN</Text>
//                   </View>
//                 )}

//                 <View style={styles.innerCard}>
//                   <Text style={styles.planTitle}>{plan.name}</Text>

//                   <Text style={styles.planSubtitle}>{description}</Text>

//                   <View style={styles.priceRow}>
//                     <Text style={styles.price}>
//                       ${plan.price?.[selectedCadence] ?? 0}
//                     </Text>
//                     <Text style={styles.cadence}>
//                       / {selectedCadence === 'annual' ? 'year' : selectedCadence}
//                     </Text>
//                   </View>

//                   <View style={{ marginTop: scale(12) }}>
//                     {features.length > 0 ? (
//                       features.map((feature: string, i: number) => (
//                         <View key={i} style={styles.featureRow}>
//                           <Image
//                             source={CHECK}
//                             style={styles.featureIcon}
//                             resizeMode="contain"
//                           />
//                           <Text style={styles.featureText}>{feature}</Text>
//                         </View>
//                       ))
//                     ) : (
//                       <Text style={styles.featureText}>No features listed</Text>
//                     )}
//                   </View>

//                   <TouchableOpacity
//                     style={[
//                       styles.ctaBtn,
//                       isMostPopular && { backgroundColor: '#333' },
//                       loadingPlan === plan._id && { opacity: 0.6 },
//                     ]}
//                     activeOpacity={0.9}
//                     disabled={loadingPlan === plan._id}
//                     onPress={() => handleSubscribe(plan._id)}
//                   >
//                     <Text
//                       style={[
//                         styles.ctaText,
//                         isMostPopular && { color: '#fff' },
//                       ]}
//                     >
//                       {loadingPlan === plan._id ? 'Processing...' : 'Subscribe Now'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             );
//           })
//         ) : (
//           <Text style={{ textAlign: 'center', marginTop: 20 }}>No plans available.</Text>
//         )}

//         <PaymentStatusModal
//           visible={showStatusModal}
//           status={
//             paymentStatus === 'pending' ||
//             paymentStatus === 'completed' ||
//             paymentStatus === 'failed'
//               ? paymentStatus
//               : null
//           }
//           onClose={() => setShowStatusModal(false)}
//         />
//       </ScrollView>
//     </View>
//   );
// };

// export default PricingScreen;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  AppState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import { API_SUBSCRIPTION_PLANS } from '../../Utils/api/APIConstant';
import Header from '../../Components/Header';
import { navigate } from '../../Navigators/utils';
import { styles } from '../../style/PricingStyles';
import { useAuth } from '../Auth/AuthContext';
import PaymentStatusModal from '../../Components/PaymentStatusModal';
import { useFocusEffect } from '@react-navigation/native';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

const LOGO = require('../../icons/logoblack.png');
const AVATAR = require('../../icons/user.png');
const CHECK = require('../../icons/checkBlue.png');
const DOT = require('../../icons/dot.png');
const PricingScreen: React.FC = () => {
  const [selectedCadence, setSelectedCadence] = useState<
    'weekly' | 'monthly' | 'annual'
  >('monthly');
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  // ✅ Fetch subscription plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_SUBSCRIPTION_PLANS });
      console.log('🟦 Plans Response:', res?.data);
      return res?.data || [];
    },
  });

  // ✅ Find the most expensive plan
  const mostExpensive =
    Array.isArray(plans) && plans.length
      ? plans.reduce((prev, curr) =>
          (curr.price?.[selectedCadence] || 0) >
          (prev.price?.[selectedCadence] || 0)
            ? curr
            : prev,
        )
      : null;

  // ✅ Handle subscribe click
  const handleSubscribe = async (planId: string) => {
    try {
      const billingCycle = selectedCadence;
      const userId =
        (session as any)?.user?.id ||
        (session as any)?.user?._id ||
        (session as any)?.user?.userId;
      const token = session?.accessToken;

      if (!token || !userId) {
        Alert.alert(
          'Please log in',
          'You need to log in to subscribe to a plan.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => navigate('Login', {} as any) },
          ],
        );
        return;
      }

      console.log('🟩 Creating checkout for:', {
        planId,
        userId,
        billingCycle,
      });
      setLoadingPlan(planId);

      const res = await fetch(
        `http://192.168.1.36:9991/api/billing/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planId,
            userId,
            billingCycle,
          }),
        },
      );

      const json = await res.json();
      console.log('🟢 Checkout Response:', json);

      if (!res.ok || !json?.data?.checkoutUrl) {
        throw new Error(json?.error || 'Failed to create checkout');
      }

      const { checkoutUrl, transactionId } = json.data;

      if (!checkoutUrl || !checkoutUrl.startsWith('http')) {
        Alert.alert('Error', 'Invalid checkout URL.');
        return;
      }

      // ✅ store transaction ID so appState can detect on return
      setTransactionId(transactionId);

      // open checkout
      await Linking.openURL(checkoutUrl);

      // ✅ show modal in background as “waiting”
      setPaymentStatus('pending');
      setShowStatusModal(true);
    } catch (e: any) {
      console.error('Checkout error:', e);
      Alert.alert('Error', e.message || 'Something went wrong.');
    } finally {
      setLoadingPlan(null);
    }
  };

  // ✅ Check payment status on resume
  const appState = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', async nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (transactionId) {
          try {
            console.log('🔄 Checking payment for:', transactionId);
            const res = await fetch(
              `http://192.168.1.36:9991/api/billing/billing-check/${transactionId}`,
            );
            const json = await res.json();
            const status = json?.data?.paymentStatus;

            console.log('✅ Payment check:', status);

            if (status === 'completed') setPaymentStatus('completed');
            else if (status === 'failed') setPaymentStatus('failed');
            else setPaymentStatus('pending');

            setShowStatusModal(true);
          } catch (err) {
            console.error('Error checking payment:', err);
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => sub.remove();
  }, [transactionId]);

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top }} />
      <Header
        logoSource={LOGO}
        avatarSource={AVATAR}
        guestRoute="More"
        authRoute="More"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(28) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Subscription Plans</Text>

        {/* TOGGLE */}
        <View style={styles.toggleContainer}>
          {['weekly', 'monthly', 'annual'].map(cadence => (
            <TouchableOpacity
              key={cadence}
              style={[
                styles.toggleButton,
                selectedCadence === cadence && styles.toggleButtonActive,
              ]}
              onPress={() => setSelectedCadence(cadence as any)}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedCadence === cadence && styles.toggleTextActive,
                ]}
              >
                {cadence === 'annual'
                  ? 'Yearly'
                  : cadence.charAt(0).toUpperCase() + cadence.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCadence === 'annual' && (
          <Text style={styles.discountText}>
            🎉 Save 15% with yearly subscription
          </Text>
        )}

        {/* PLANS */}
        {isLoading ? (
          <ActivityIndicator
            style={{ marginTop: 30 }}
            size="large"
            color="#2260B2"
          />
        ) : Array.isArray(plans) && plans.length > 0 ? (
          plans.map(plan => {
            const price =
              plan.price?.[selectedCadence] ??
              plan.price?.yearly ??
              plan.price?.annual ??
              0;
            const description =
              plan.description?.[selectedCadence] ??
              plan.description?.yearly ??
              plan.description?.annual ??
              plan.description?.monthly ??
              'No description available';
            const features =
              plan.features?.[selectedCadence] ??
              plan.features?.yearly ??
              plan.features?.annual ??
              plan.features?.monthly ??
              [];

            const isMostPopular = plan._id === mostExpensive?._id;
            const isFree = price === 0;

            return (
              <View
                key={plan._id}
                style={[
                  styles.planCard,
                  isMostPopular && { borderColor: '#2260B2', borderWidth: 3 },
                ]}
              >
                {isMostPopular && (
                  <View style={styles.ribbon}>
                    <Text style={styles.ribbonText}>MOST POPULAR PLAN</Text>
                  </View>
                )}

                <View style={styles.innerCard}>
                  <Text style={styles.planTitle}>{plan.name}</Text>
                  <Text style={styles.planSubtitle}>{description}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      {isFree ? 'Free' : `$${price}`}
                    </Text>
                    {!isFree && (
                      <Text style={styles.cadence}>
                        /{' '}
                        {selectedCadence === 'annual'
                          ? 'yearly'
                          : selectedCadence}
                      </Text>
                    )}
                  </View>

                  {/* FEATURES */}
                  <View style={{ marginTop: scale(12) }}>
                    {Array.isArray(features) && features.length > 0 ? (
                      features.map((feature: string, i: number) => (
                        <View key={i} style={styles.featureRow}>
                          <Image
                            source={i === 0 ? CHECK : DOT}
                            style={[
                              styles.featureIcon,
                              i === 0 && styles.featureIconBlue,
                            ]}
                          />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.featureText}>No features listed</Text>
                    )}
                  </View>

                  {/* BUTTON */}
                  <TouchableOpacity
                    style={[
                      styles.ctaBtn,
                      { backgroundColor: isFree ? '#2c232333' : '#333' },
                      loadingPlan === plan._id && { opacity: 0.6 },
                    ]}
                    activeOpacity={0.9}
                    disabled={isFree || loadingPlan === plan._id}
                    onPress={() => handleSubscribe(plan._id)}
                  >
                    <Text style={[styles.ctaText, { color: '#fff' }]}>
                      {isFree
                        ? 'Activated'
                        : loadingPlan === plan._id
                        ? 'Processing...'
                        : 'Subscribe Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No plans available.
          </Text>
        )}

        {transactionId && (
          <PaymentStatusModal
            visible={showStatusModal}
            status={
              paymentStatus === 'pending' ||
              paymentStatus === 'completed' ||
              paymentStatus === 'failed'
                ? paymentStatus
                : null
            }
            onClose={() => setShowStatusModal(false)}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default PricingScreen;
