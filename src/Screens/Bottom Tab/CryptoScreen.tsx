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
    setLoading(true);
    try {
      const res = await getApiWithOutQuery({
        url:
          API_ARTICLES_CATEGORIES +
          `?categoryId=${activeTab !== 'all' ? activeTab : ''}&domainType=${domain?.type}`,
      });
      setArticles(res.data?.articles ?? []);
      // setArticles(list);
    } catch (err) {
      setArticles([]);
      console.log('Error fetching articles for tab:', activeTab, err);
    } finally {
      setLoading(false);
    }
  }, [activeTab , domain?.type]);

  // Fetch on focus + when tab/domain changes
  useFocusEffect(
    useCallback(() => {
      fetchArticles();
    }, [fetchArticles]),
  );

  const handleArticlePress = (id: string, slug: string) => {
    navigate('ArticleDetail' as never, { id, slug } as never);
  };

  // ── UI ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: '#e3e9ee',
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
          })}
        </ScrollView>
      </View>

      {/* Scroll Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(80) }}
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: scale(20) }} />
        ) : (
          articles.map(item => (
            <TouchableOpacity
              key={item._id}
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
                  numberOfLines={1}
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
              {!!item.image && (
                <Image source={{ uri: item.image }} style={styles.rowThumb} />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default CryptoScreen;
