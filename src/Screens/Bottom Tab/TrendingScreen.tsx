import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ImageSourcePropType,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../style/TrendingStyles';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import {
  API_ARTICLES_CATEGORIES,
  API_ARTICLES_LIST,
  API_GET_ARTICLES_BY_TYPE,
} from '../../Utils/api/APIConstant';
import ShowToast from '../../Utils/ShowToast';
import { navigate } from '../../Navigators/utils';
import { useAuth } from '../Auth/AuthContext';
import Header from '../../Components/Header';
import { ScrollView } from 'react-native-gesture-handler';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

// ── assets ─────────────────────────
const LOGO = require('../../icons/logoblack.png');
const AVATAR = require('../../icons/user.png');
const BIG1 = require('../../icons/news.png');
const BIG2 = require('../../icons/news2.png');
const BIG3 = require('../../icons/news3.png');

type Article = {
  _id: string;
  title: string;
  description: string;
  image: string;
  slug: string;
  articleCategoryId?: { _id?: string; title?: string };
  status?: string;
  articleType?: string;
  createdAt?: string;
  viewCount?: number;
  commentCount?: number;
};

const toSrc = (img: ImageSourcePropType | string) =>
  typeof img === 'string' ? { uri: img } : img;

const TAB_BAR_APPROX_HEIGHT = 72; // adjust if your bottom tab height differs

const TrendingScreen: React.FC = () => {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // Breaking / Top / Latest / Trending header strips
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  useEffect(() => {
    // Only breaking is used in header; keep the rest if you want
    const getBreaking = async () => {
      try {
        const res = await getApiWithOutQuery({
          url: API_GET_ARTICLES_BY_TYPE + '/breaking',
        });
        setBreakingNews(res?.data?.articles ?? []);
      } catch {
        setBreakingNews([]);
      }
    };
    getBreaking();
  }, []);

  // Categories
  const { data: categoryData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({
        url: API_ARTICLES_CATEGORIES.replace('/articles', '') || '/categories',
      }); // fallback if constant differs
      // You used API_CATEGORIES earlier; keep it if that’s the right one:
      // const res = await getApiWithOutQuery({ url: API_CATEGORIES });
      return (
        res.data?.categories?.filter((c: any) => c.status === 'active') ?? []
      );
    },
  });

  // Tabs incl. "All"
  const tabs = [{ _id: 'all', title: 'All' }, ...categoryData];
  const activeTabTitle = useMemo(() => {
    const tab = tabs.find(t => t._id === activeTab);
    return tab ? tab.title : 'All News';
  }, [activeTab, tabs]);

  const handleArticlePress = (id: string, slug: string) => {
    if (!session?.accessToken) {
      ShowToast('Please login to read this article', 'error');
      navigate('Login' as never);
      return;
    }
    navigate('ArticleDetail' as never, { id, slug } as never);
  };

  // ---- Pagination with useInfiniteQuery ----
  const LIMIT = 10;

  const buildUrl = useCallback(
    (page: number) => {
      if (categoryId && categoryId !== 'all') {
        // e.g. /articles/categories?categoryId=...&page=..&limit=..
        const sep = API_ARTICLES_CATEGORIES.includes('?') ? '&' : '?';
        return `${API_ARTICLES_CATEGORIES}${sep}categoryId=${categoryId}&page=${page}&limit=${LIMIT}`;
      }
      // e.g. /articles/list?page=..&limit=..
      const sep = API_ARTICLES_LIST.includes('?') ? '&' : '?';
      return `${API_ARTICLES_LIST}${sep}page=${page}&limit=${LIMIT}`;
    },
    [categoryId],
  );

  type PagePayload = {
    page: number;
    items: Article[];
    totalPages: number;
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery<PagePayload>({
    queryKey: ['articles-infinite', categoryId ?? 'all'],
    initialPageParam: 1, // ✅ REQUIRED IN V5
    queryFn: async ({ pageParam }) => {
      const url = buildUrl(pageParam as number);
      const res = await getApiWithOutQuery({ url });

      const payload = res.data?.data ?? res.data ?? {};
      const items: Article[] = payload.articles ?? [];
      const pagination = payload.pagination ?? {};

      return {
        page: Number(pageParam) || 1,
        items,
        totalPages:
          Number(pagination.totalPages) ||
          (items.length ? (Number(pageParam) || 1) + 1 : 1),
      };
    },
    getNextPageParam: lastPage => {
      const next = (lastPage.page ?? 1) + 1;
      return next <= (lastPage.totalPages ?? next) ? next : undefined;
    },
    staleTime: 60_000,
  });

  // Flatten pages
  const articles: Article[] = useMemo(
    () => (data?.pages ?? []).flatMap(p => p.items ?? []),
    [data],
  );

  // Pull to refresh handler (restarts from page 1)
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Header above the list (logo, avatar, tabs, breaking)
  const ListTopHeader = (
    <View
      style={{
        backgroundColor: '#e3e9ee',
        borderBottomLeftRadius: scale(18),
        borderBottomRightRadius: scale(15),
        paddingBottom: scale(10),
        paddingTop: insets.top,
      }}
    >
      {/* Top bar */}
      <Header
        logoSource={LOGO}
        avatarSource={AVATAR}
        guestRoute="More"
        profileEndpoint="/profile"
        authRoute="More"
      />

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tabs}
          keyExtractor={(c: any) => c._id}
          renderItem={({ item: c }: any) => {
            const isActive = activeTab === c._id;
            return (
              <TouchableOpacity
                onPress={() => {
                  setActiveTab(c._id);
                  setCategoryId(c._id === 'all' ? null : c._id);
                }}
                style={styles.tabBtn}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {c.title}
                </Text>
                <View
                  style={[
                    styles.tabBar,
                    isActive ? styles.tabBarActive : styles.tabBarGhost,
                  ]}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
      
      {/* Breaking News strip */}
      <Text style={styles.sectionTitle}>Breaking News</Text>
      <FlatList
        data={breakingNews}
        keyExtractor={i => i._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: scale(16) }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.breakCard} activeOpacity={0.8}>
            <ImageBackground
              source={toSrc(item.image)}
              style={styles.breakImage}
              imageStyle={styles.breakImageRadius}
            />
            <Text style={styles.breakCaption} numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Section title for main list */}
      <Text style={[styles.sectionTitle, { marginTop: scale(18) }]}>
        {activeTabTitle} News
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={item => item._id}
        ListHeaderComponent={ListTopHeader}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.rowCard}
            onPress={() => handleArticlePress(item._id, item.slug)}
            activeOpacity={0.8}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.rowTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text
                style={styles.metaText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {(item.description || '').replace(/<[^>]+>/g, '')}
              </Text>
              <View style={styles.metaRow}>
                <Image
                  source={require('../../icons/comment.png')}
                  style={styles.metaIconImg}
                />
                <Text style={styles.metaText}>{item.commentCount ?? 0}</Text>
                <View style={{ width: 10 }} />
                <Image
                  source={require('../../icons/eye.png')}
                  style={styles.metaIconImg}
                />
                <Text style={styles.metaText}>{item.viewCount ?? 0}+</Text>
              </View>
            </View>
            <Image source={{ uri: item.image }} style={styles.rowThumb} />
          </TouchableOpacity>
        )}
        // IMPORTANT: give the list enough bottom space
        contentContainerStyle={{
          paddingBottom: insets.bottom + TAB_BAR_APPROX_HEIGHT + scale(12),
        }}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        refreshing={isLoading}
        onRefresh={onRefresh}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default TrendingScreen;
