import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Image,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../style/SubscriptionBillingStyles';
import { goBackNavigation, navigate } from '../Navigators/utils';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../Utils/api/common';
import { useAuth } from './Auth/AuthContext';
import { API_BILLING_LIST } from '../Utils/api/APIConstant';

const BACK_ARROW = require('../icons/back.png');

interface Payment {
  billingCycle: string;
  startDate: string;
  endDate: string;
  status: 'Paid' | 'Pending' | 'Failed';
  amount: string;
  createdAt: string;
  planId?: {
    id?: string;
    name?: string;
  };
}

const SubscriptionBillingScreen = () => {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const userId = session?.user?.id;

  // ⚙️ Fetch Billing Data
  const { data, isLoading, isError } = useQuery({
    enabled: !!userId,
    queryKey: ['user-billing', userId],
    queryFn: async () => {
      const res = await getApiWithOutQuery({
        url: `${API_BILLING_LIST}/${userId}`,
      });
      return res?.data ?? { payments: [], upgradeAvailable: false };
    },
  });

  const payments: Payment[] = data?.payments ?? [];

  const handleViewInvoice = (url: string) => {
    if (url) Linking.openURL(url);
  };

  const renderItem = ({ item }: { item: Payment }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.billingCycle}</Text>
      <Text style={styles.cell}>{item.startDate}</Text>
      <Text style={styles.cell}>{item.endDate}</Text>

      <View
        style={[
          styles.statusBadge,
          item.status === 'Paid'
            ? styles.paid
            : item.status === 'Pending'
              ? styles.pending
              : styles.failed,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            item.status === 'Paid'
              ? styles.paidText
              : item.status === 'Pending'
                ? styles.pendingText
                : styles.failedText,
          ]}
        >
          {item.status}
        </Text>
      </View>

      <Text style={styles.cell}>${item.amount}</Text>
      <Text style={styles.cell}>
        {new Date(item.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => goBackNavigation()}
        >
          <Image source={BACK_ARROW} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription & Billing</Text>
        <View style={styles.placeholder} />
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
          {/* 🟩 Active Plan Banner */}
          {payments?.length > 0 && (
            <View style={styles.activeBanner}>
              <View style={styles.bannerIconCircle}>
                <Text style={styles.bannerIcon}>!</Text>
              </View>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ flex: 0 }}>
                  <Text style={styles.bannerTitle}>
                    You are on the {payments[0]?.planId?.name} plan.
                  </Text>
                  <Text style={styles.bannerSubtitle}>
                    Your plan renews on{' '}
                    {new Date(payments[0]?.endDate).toLocaleDateString()}.
                  </Text>
                </View>
              </View>

              {/* ✅ Conditional Upgrade Button */}
              {(() => {
                const endDate = new Date(payments[0]?.endDate);
                const today = new Date();
                const daysLeft = Math.ceil(
                  (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
                );

                const currentPlan =
                  payments[0]?.planId?.name?.toLowerCase() ?? '';
                let showUpgrade = false;

                const isWeekly =
                  currentPlan.includes('week') ||
                  currentPlan.includes('standard');
                const isMonthly = currentPlan.includes('month');
                const isAnnual =
                  currentPlan.includes('year') ||
                  currentPlan.includes('annual');

                if (
                  (isWeekly && daysLeft <= 1) ||
                  (isMonthly && daysLeft <= 5)
                ) {
                  showUpgrade = true;
                }

                if (showUpgrade) {
                  return (
                    <TouchableOpacity
                      style={styles.upgradeButton}
                      onPress={() => navigate('PricingScreen' as never)}
                    >
                      <Text style={styles.upgradeButtonText}>Upgrade</Text>
                    </TouchableOpacity>
                  );
                }
                return null;
              })()}
            </View>
          )}

          {/* 🧾 Billing History */}
          <Text style={styles.sectionTitle}>Billing history</Text>
          <Text style={styles.sectionSubtitle}>
            Here you see your billing list.
          </Text>

          {payments?.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#555' }}>
              No billing history found.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: 'column' }}
            >
              <View style={styles.tablecontainer}>
                {/* Table Header */}
                <View style={[styles.row, styles.headerRow]}>
                  <Text style={[styles.headerCell, { minWidth: 120 }]}>
                    Payment Cycle
                  </Text>
                  <Text style={[styles.headerCell, { minWidth: 120 }]}>
                    Start Date
                  </Text>
                  <Text style={[styles.headerCell, { minWidth: 120 }]}>
                    End Date
                  </Text>
                  <Text style={[styles.headerCell, { minWidth: 130 }]}>
                    Payment Status
                  </Text>
                  <Text style={[styles.headerCell, { minWidth: 100 }]}>
                    Amount
                  </Text>
                  <Text style={[styles.headerCell, { minWidth: 150 }]}>
                    CreatedAt
                  </Text>
                </View>

                {/* Table Body */}
                <FlatList
                  data={payments}
                  renderItem={renderItem}
                  keyExtractor={(_, index) => index.toString()}
                  scrollEnabled={false}
                />
              </View>
            </ScrollView>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default SubscriptionBillingScreen;
