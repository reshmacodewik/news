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

const TrendingScreen: React.FC = () => {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch Breaking News ─────────────────────────────
  useEffect(() => {
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

  // ── Fetch Categories ─────────────────────────────
  const { data: categoryData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({
        url: API_ARTICLES_CATEGORIES.replace('/articles', '') || '/categories',
      });
      return res.data?.categories?.filter((c: any) => c.status === 'active') ?? [];
    },
  });

  // Tabs (with "All")
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

  // ── Fetch Articles by Category ──────────────────────
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        activeTab === 'all'
          ? `${API_ARTICLES_LIST}?limit=20`
          : `${API_ARTICLES_LIST}?categoryId=${categoryId}&limit=20`;
      const res = await getApiWithOutQuery({ url });
      const data = res?.data?.data ?? res?.data ?? {};
      setArticles(data.articles ?? []);
    } catch (err) {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, categoryId]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // ── UI ──────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
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
          })}
        </ScrollView>
      </View>

      {/* Scroll Content */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + scale(20),
        }}
      >
        {/* Breaking News */}
        <Text style={[styles.sectionTitle, { marginTop: scale(16) }]}>
          Breaking News
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: scale(16) }}
        >
          {breakingNews.map(item => (
            <TouchableOpacity key={item._id} style={styles.breakCard} activeOpacity={0.8}  onPress={() => handleArticlePress(item._id, item.slug)}>
              <ImageBackground
                source={toSrc(item.image)}
                style={styles.breakImage}
                imageStyle={styles.breakImageRadius}
              />
              <Text style={styles.breakCaption} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Articles */}
        <Text style={[styles.sectionTitle, { marginTop: scale(18) }]}>
          {activeTabTitle} News
        </Text>

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
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default TrendingScreen;
