import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../style/TrendingStyles';
import { useQuery } from '@tanstack/react-query';
import { getApiByParams, getApiWithOutQuery } from '../../Utils/api/common';
import {
  API_ARTICLES_CATEGORIES,
  API_ARTICLES_LIST,
  API_CATEGORIES,
  API_CATEGORIES_BY_DOMAIN,
  API_DOMAIN_LIST,
  API_GET_ARTICLES_BY_DOMAIN_TYPE,
  API_GET_ARTICLES_BY_TYPE,
} from '../../Utils/api/APIConstant';
import ShowToast from '../../Utils/ShowToast';
import { navigate } from '../../Navigators/utils';
import { useAuth } from '../Auth/AuthContext';
import Header from '../../Components/Header';
import { useFocusEffect } from '@react-navigation/native';
import { useDomainByType } from '../../Hook/useDomainByType';
import NewsCard from '../../Components/NewsCard';
import { useTheme } from '../../context/ThemeContext';

const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

const LOGO = require('../../icons/logoblack.png');
const AVATAR = require('../../icons/user.png');

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

const toSrc = (img: string) => ({ uri: img });

const CryptoScreen: React.FC = () => {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const { domain, domainId } = useDomainByType('crypto');
 const { theme, colors } = useTheme();
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const { data: categoryDataRaw = [] } = useQuery({
    queryKey: ['categories-domain', domainId],
    queryFn: async () => {
      const res = await getApiByParams({
        url: API_CATEGORIES_BY_DOMAIN,
        params: domainId,
      });
      return res.data ?? [];
    },
  });

  const rawCategoryArray: any[] = useMemo(() => {
    if (Array.isArray(categoryDataRaw)) return categoryDataRaw;
    if (Array.isArray((categoryDataRaw as any)?.data))
      return (categoryDataRaw as any).data;
    return [];
  }, [categoryDataRaw]);

  // Coerce to {_id, title} with robust fallbacks
  const categories: Array<{ _id: string; title: string }> = useMemo(() => {
    return rawCategoryArray
      .map((c: any) => {
        const id = c?._id ?? c?.id ?? c?.value ?? String(c);
        const title =
          c?.title ??
          c?.name ??
          c?.label ??
          c?.category_title ??
          c?.categoryName ??
          'Untitled';
        return id ? { _id: String(id), title: String(title) } : null;
      })
      .filter(Boolean) as Array<{ _id: string; title: string }>;
  }, [rawCategoryArray]);

  // --- Tabs: always include "All" first --------------------------------
  const tabs = useMemo(
    () => [{ _id: 'all', title: 'All' }, ...categories],
    [categories],
  );

  // If domainId changes, reset to "all" so All is always valid
  useEffect(() => {
    setActiveTab('all');
  }, []);

  // If current activeTab no longer exists (e.g., category list changed), snap back to "all"
  useEffect(() => {
    const exists = tabs.some(t => t._id === activeTab);
    if (!exists) setActiveTab('all');
  }, [tabs, activeTab]);

  const activeTabTitle = useMemo(() => {
    const tab = tabs.find(t => t._id === activeTab);
    return tab ? tab.title : 'All';
  }, [activeTab, tabs]);

 const fetchArticles = useCallback(async () => {
    try {
      const res = await getApiWithOutQuery({
        url:
          API_ARTICLES_CATEGORIES +
          `?categoryId=${activeTab !== 'all' ? activeTab : ''}` +
          `&domainType=${domain?.type}` +
          `&page=${page}&limit=10`,
      });

      const newItems = res.data?.articles ?? [];

      if (page === 1) {
        setArticles(newItems); // first load
      } else {
        setArticles(prev => [...prev, ...newItems]); // append pages
      }

      setHasNextPage(
        res.data?.pagination?.page < res.data?.pagination?.totalPages,
      );
    } catch (err) {
      console.log('Error:', err);
    }
  }, [page, activeTab, domain?.type]);

  useEffect(() => {
    setPage(1);
    setArticles([]);
  }, [activeTab]);


  // Fetch on focus + when tab/domain changes
  useFocusEffect(
    useCallback(() => {
      fetchArticles();
    }, [fetchArticles]),
  );

  const handleArticlePress = (id: string, slug: string) => {
    navigate('ArticleDetail' as never, { id, slug } as never);
  };
  const getCategoryTitle = (articleCategoryId: any) => {
    if (!articleCategoryId) return 'General';
    if (typeof articleCategoryId === 'object' && articleCategoryId.title)
      return articleCategoryId.title;

    const match = categories.find((c: any) => c._id === articleCategoryId);
    return match?.title || 'General';
  };
  // ── UI ─────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={{
          backgroundColor: colors.background,
          borderBottomLeftRadius: scale(18),
          borderBottomRightRadius: scale(15),
          paddingBottom: scale(10),
          paddingTop: insets.top,
        }}
      >
        <Header
          logoSource={LOGO}
          avatarSource={AVATAR}
          guestRoute="More"
          authRoute="More"
        />

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsWrap}
          contentContainerStyle={{ paddingHorizontal: scale(12) }}
        >
          {tabs.map(c => {
            const isActive = activeTab === c._id;
            return (
              <TouchableOpacity
                key={c._id}
                onPress={() => setActiveTab(c._id)}
                style={styles.tabBtn}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive,isActive && { color: colors.tabtext }]}
                >
                  {c.title}
                </Text>
                <View
                  style={[
                    styles.tabBar,
                    isActive ? styles.tabBarActive : styles.tabBarGhost,
                    isActive && { backgroundColor: colors.tabtext },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Scroll Content */}
     <FlatList
        data={articles}
        keyExtractor={item => item._id}
        contentContainerStyle={{
          paddingBottom: insets.bottom + scale(80),
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: scale(20) }}>
            No articles found
          </Text>
        }
        renderItem={({ item }) => (
          <NewsCard
            category={
              (item.articleCategoryId?.title || 'News')
                .charAt(0)
                .toUpperCase() +
              (item.articleCategoryId?.title || 'News').slice(1)
            }
            title={item.title}
            description={(item.description || '').replace(/<[^>]+>/g, '')}
            image={item.image}
            commentCount={item.commentCount}
            viewCount={item.viewCount}
            onPress={() => handleArticlePress(item._id, item.slug)}
          />
        )}
        // 🔥 Infinite scroll
        onEndReached={() => {
          if (hasNextPage) {
            setPage(prev => prev + 1);
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          hasNextPage ? (
            <ActivityIndicator style={{ marginVertical: scale(20) }} />
          ) : (
            <View style={{ height: scale(20) }} />
          )
        }
      />
    </View>
  );
};

export default CryptoScreen;
