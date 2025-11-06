import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { API_GET_PREMIUM_ARTICLES } from '../../Utils/api/APIConstant';
import { getApiWithOutQuery } from '../../Utils/api/common';
import NewsCard from '../../Components/NewsCard';
import Header from '../../Components/Header';
// <-- change path if needed

type Article = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  viewCount?: number;
  commentCount?: number;
  viewingType?: 'free' | 'register' | 'premium';
  articleCategoryId?: { title?: string };
  category?: { title?: string };
  [key: string]: any;
};
const LOGO = require('../../icons/headerlogo.png');
const AVATAR = require('../../icons/user.png');
const PremiumOnlyScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 10;

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    bootstrap();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bootstrap = async () => {
    setLoading(true);
    try {
      await loadPremiumArticles(1);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const loadPremiumArticles = async (pageNumber = 1) => {
    try {
      const url = `${API_GET_PREMIUM_ARTICLES}?page=${pageNumber}&limit=${limit}`;
      const res = await getApiWithOutQuery({ url });

      if (!mountedRef.current) return;

      if (res?.success && Array.isArray(res?.data?.articles)) {
        const onlyPremium = (res.data.articles as Article[]).filter(
          a => a.viewingType === 'premium',
        );
        setArticles(onlyPremium);
        setPage(res?.data?.pagination?.page || pageNumber);
        setTotalPages(res?.data?.pagination?.totalPages || 1);
        setTotal(
          res?.data?.pagination?.total ||
            res?.data?.total ||
            onlyPremium.length ||
            0,
        );
      } else {
        setArticles([]);
        setPage(1);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (e) {
      setArticles([]);
      setPage(1);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPremiumArticles(page || 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) loadPremiumArticles(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) loadPremiumArticles(page - 1);
  };

  const handleGoToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) loadPremiumArticles(p);
  };

  const pageList = useMemo<(number | string)[]>(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    return [1, 2, '...', totalPages - 1, totalPages];
  }, [totalPages]);

  const showingStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingEnd = Math.min(page * limit, total);

  const goToDetail = (slug: string) => {
    // adjust route name/params to your app
    navigation.navigate('ArticleDetail', { slug, id: slug });
  };

  const ListHeader = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 0 }}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>
        Premium Articles
      </Text>
    </View>
  );

  // const ListFooter = () => (
  //   <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
  //     {/* Summary */}
  //     <View style={styles.summaryRow}>
  //       <Text style={styles.summaryText}>
  //         Showing <Text style={styles.summaryStrong}>{showingStart}</Text> to{' '}
  //         <Text style={styles.summaryStrong}>{showingEnd}</Text> of{' '}
  //         <Text style={styles.summaryStrong}>{total}</Text> results
  //       </Text>
  //     </View>

  //     {/* Pagination */}
  //     <View style={styles.pagerRow}>
  //       <TouchableOpacity
  //         onPress={handlePrevPage}
  //         disabled={page === 1}
  //         style={[styles.pagerBtn, page === 1 && { opacity: 0.5 }]}
  //       >
  //         <Text style={styles.pagerBtnText}>{'‹'} Prev</Text>
  //       </TouchableOpacity>

  //       <View style={styles.pageListRow}>
  //         {pageList.map((p, idx) =>
  //           p === '...' ? (
  //             <View key={`ellipsis-${idx}`} style={styles.ellipsis}>
  //               <Text style={styles.ellipsisText}>…</Text>
  //             </View>
  //           ) : (
  //             <TouchableOpacity
  //               key={`p-${p}`}
  //               onPress={() => handleGoToPage(p as number)}
  //               style={[styles.pageBtn, page === p && styles.pageBtnActive]}
  //             >
  //               <Text
  //                 style={[
  //                   styles.pageBtnText,
  //                   page === p && styles.pageBtnTextActive,
  //                 ]}
  //               >
  //                 {p}
  //               </Text>
  //             </TouchableOpacity>
  //           ),
  //         )}
  //       </View>

  //       <TouchableOpacity
  //         onPress={handleNextPage}
  //         disabled={page === totalPages}
  //         style={[styles.pagerBtn, page === totalPages && { opacity: 0.5 }]}
  //       >
  //         <Text style={styles.pagerBtnText}>Next {'›'}</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // );

  if (loading) {
    return (
      <View
        style={[
          styles.fullCenter,
          { paddingTop: insets.top, backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color="#2260B2" />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: colors.background,
      }}
    >
      <Header
        logoSource={LOGO}
        avatarSource={AVATAR}
        guestRoute="More"
        authRoute="More"
       
      />
      <FlatList
        data={articles}
        keyExtractor={item => item._id}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <NewsCard
            category={(
              item.articleCategoryId?.title ||
              item.category?.title ||
              ''
            ).toUpperCase()}
            title={item.title}
            description={item.description}
            image={item.image}
            commentCount={item.commentCount}
            viewCount={item.viewCount}
            onPress={() => goToDetail(item.slug)}
            // 👇 show the badge only on this screen
            showPremiumBadge
          />
        )}
        ListEmptyComponent={
          <View style={{ padding: 16 }}>
            <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
              <Text style={{ color: '#6B7280' }}>No data found</Text>
            </View>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fullCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  headerTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },

  summaryRow: { paddingBottom: 8 },
  summaryText: { fontSize: 13, color: '#6B7280' },
  summaryStrong: { fontWeight: '700', color: '#0B1426' },

  pagerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pagerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  pagerBtnText: { fontSize: 14, fontWeight: '600', color: '#0B1426' },

  pageListRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    minWidth: 42,
    alignItems: 'center',
  },
  pageBtnActive: { backgroundColor: '#2260B2', borderColor: '#2260B2' },
  pageBtnText: { fontSize: 14, fontWeight: '700', color: '#0B1426' },
  pageBtnTextActive: { color: '#fff', fontWeight: '800' },
  ellipsis: { paddingHorizontal: 10, paddingVertical: 10 },
  ellipsisText: { fontSize: 16, color: '#6B7280' },

  emptyCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    borderRadius: 12,
  },
});

export default PremiumOnlyScreen;
