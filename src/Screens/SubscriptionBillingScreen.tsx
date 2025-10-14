import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../style/SubscriptionBillingStyles';
import { goBackNavigation } from '../Navigators/utils';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../Utils/api/common';

import { useAuth } from './Auth/AuthContext';
import { API_BILLING_LIST } from '../Utils/api/APIConstant';

const SubscriptionBillingScreen = () => {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const userId = session?.user?.id;

  // ⚙️ Fetch Billing Data
  const { data, isLoading, isError } = useQuery({
    enabled: !!userId, // only run when userId exists
    queryKey: ['user-billing', userId],
    queryFn: async () => {
      const res = await getApiWithOutQuery({
        url: `${API_BILLING_LIST}/${userId}`,
      });
      console.log('resp', res);
      return res?.data ?? { payments: [], upgradeAvailable: false };
    },
  });

  const payments = data?.payments ?? [];

  const handleViewInvoice = (url: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => goBackNavigation()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription & Billing</Text>
      </View>

      {/* Loading & Error States */}
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : isError ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: 'red' }}>Failed to load billing data</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Active Plan Banner */}
          {/* Active Plan Banner */}
          {payments?.length > 0 && (
            <View style={styles.activeBanner}>
              <View style={styles.bannerIconCircle}>
                <Text style={styles.bannerIcon}>!</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>
                  You are on the {payments[0]?.planId?.name} plan.
                </Text>
                <Text style={styles.bannerSubtitle}>
                  Your plan renews on{' '}
                  {new Date(payments[0]?.endDate).toLocaleDateString()}.
                </Text>
              </View>

              {/* ✅ Conditional Upgrade Button */}
              {(() => {
                const endDate = new Date(payments[0]?.endDate);
                const today = new Date();
                const daysLeft = Math.ceil(
                  (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                );

                const upgradeAvailable = data?.upgradeAvailable === true;

                // Show button only if upgradeAvailable = true AND more than 5 days left
                if (upgradeAvailable && daysLeft > 5) {
                  return (
                    <TouchableOpacity
                      style={styles.upgradeButton}
                      onPress={() => {
                        // TODO: Navigate to your upgrade screen
                        console.log('Upgrade button pressed');
                      }}
                    >
                      <Text style={styles.upgradeButtonText}>Upgrade</Text>
                    </TouchableOpacity>
                  );
                }

                return null; // Hide button otherwise
              })()}
            </View>
          )}

          {/* Billing History */}
          <Text style={styles.sectionTitle}>Billing history</Text>
          <Text style={styles.sectionSubtitle}>
            Here you see your billing list.
          </Text>

          {payments?.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
              No billing history found.
            </Text>
          ) : (
            payments.map((item: any) => (
              <View key={item._id} style={styles.billingCard}>
                <View style={styles.billingRow}>
                  <Text style={styles.billingDate}>
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </Text>

                  <Text style={styles.billingAmount}>
                    ${item.amount} {item.currency}
                  </Text>
                </View>
                <View style={styles.billingFooter}>
                  <View
                    style={[
                      styles.statusBadge,
                      item.paymentStatus === 'completed'
                        ? styles.statusPaid
                        : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.paymentStatus === 'completed'
                          ? styles.statusTextPaid
                          : styles.statusTextPending,
                      ]}
                    >
                      {item.paymentStatus}
                    </Text>
                  </View>

                  {/* <TouchableOpacity
                    onPress={() => handleViewInvoice(item.invoiceUrl)}
                  >
                    <Text style={styles.invoiceLink}>View invoice ↗</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default SubscriptionBillingScreen;
