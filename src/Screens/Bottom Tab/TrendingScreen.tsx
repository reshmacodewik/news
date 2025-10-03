import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../style/TrendingStyles';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import {
  API_ARTICLES_CATEGORIES,
  API_ARTICLES_LIST,
  API_CATEGORIES,
  API_GET_ARTICLES_BY_TYPE,
} from '../../Utils/api/APIConstant';
import ShowToast from '../../Utils/ShowToast';
import { navigate } from '../../Navigators/utils';
import { useAuth } from '../Auth/AuthContext';
const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

// ── assets (replace with your own) ─────────────────────────
const LOGO = require('../../icons/logoblack.png');
const AVATAR = require('../../icons/user.png');
const BIG1 = require('../../icons/news.png');
const BIG2 = require('../../icons/news2.png'); // add these images
const BIG3 = require('../../icons/news3.png');

// thumbs used in the list (rotate them)
const TH1 = require('../../icons/news.png');
const TH2 = require('../../icons/news1.png');
const TH3 = require('../../icons/news2.png');

const CATEGORIES = [
  'All',
  'Business',
  'Marketing',
  'Games',
  'Politics',
  'Tech',
  'Health',
];

type Card = { id: string; title: string; image: any };
type Row = {
  id: string;
  title: string;
  thumb: any;
  comments: number;
  views: string;
};
type Article = {
  _id: string;
  title: string;
  description: string;
  image: string;
  articleCategoryId?: {
    _id: string;
    title: string;
  };
  status?: string;
  articleType?: string;
  createdAt?: string;
};
const makeRows = (count = 10): Row[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: `r-${i + 1}`,
    title: 'Opposition Demands Transparency And Recents',
    thumb: [TH1, TH2, TH3][i % 3],
    comments: 2980 + i * 3,
    views: `${80 + i}k+`,
  }));

const BREAKING: Card[] = [
  { id: 'b1', title: 'Government Launches Economic Reform Plan', image: BIG1 },
  { id: 'b2', title: 'Higher Fuel Price Predicted', image: BIG2 },
  { id: 'b3', title: 'Markets Steady As Policy Shifts', image: BIG3 },
];
const toSrc = (img: ImageSourcePropType | string) =>
  typeof img === 'string' ? { uri: img } : img;
const TrendingScreen: React.FC = () => {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [topNews, setTopNews] = useState<Article[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [trendingNews, setTrendingNews] = useState<Article[]>([]);
  const rows = useMemo(() => makeRows(12), []);
  const handleArticlePress = (id: string) => {
    if (!session?.accessToken) {
      ShowToast('Please login to read this article', 'error');
      navigate('Login' as never);
      return;
    }
    navigate('ArticleDetail' as never, { id } as never); // ✅ pass article id
  };
  const getdata = async (type: string) => {
    try {
      const res = await getApiWithOutQuery({
        url: API_GET_ARTICLES_BY_TYPE + type,
      });
      if (res?.data) {
        if (type === '/breaking') setBreakingNews(res.data);
        if (type === '/top-news') setTopNews(res.data);
        if (type === '/latest') setLatestNews(res.data);
        if (type === '/trending') setTrendingNews(res.data);
      }
    } catch (error) {
      console.log(`Error fetching ${type}:`, error);
    }
  };
  useEffect(() => {
    getdata('/breaking');
    getdata('/top-news');
    getdata('/latest');
    getdata('/trending');
  }, []);
  const { data: categoryData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_CATEGORIES });
      return (
        res.data?.categories?.filter((c: any) => c.status === 'active') ?? []
      );
    },
  });

  // Tabs array including "All"
  const tabs = [{ _id: 'all', title: 'All' }, ...categoryData];

  // Fetch articles based on category
  const { data: articles = [] } = useQuery({
    queryKey: ['articles', categoryId],
    queryFn: async () => {
      const url =
        categoryId && categoryId !== 'all'
          ? `${API_ARTICLES_CATEGORIES}?categoryId=${categoryId}`
          : API_ARTICLES_LIST;
      const res = await getApiWithOutQuery({ url });
      return res.data?.articles ?? res.data?.data ?? [];
    },
    enabled: !!tabs.length, // wait for categories to load
  });
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(24) }}
      >
        <View
          style={{
            backgroundColor: '#e3e9ee',
            borderBottomLeftRadius: scale(18),
            borderBottomRightRadius: scale(15),
            paddingBottom: scale(10),
          }}
        >
          <View style={{ height: insets.top }} />

          <View style={styles.topBar}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            <View style={styles.avatarWrap}>
              <TouchableOpacity style={styles.avatarWrap} onPress={() => navigate('EditProfile' as never)}>
              <Image source={AVATAR} style={styles.avatar}  />
              </TouchableOpacity>
            </View>
          </View>

           <View style={styles.tabsWrap}>
          // Add a pseudo-category for "All"
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          {/* Breaking News */}
          <Text style={styles.sectionTitle}>Breaking News</Text>
          <FlatList
            data={breakingNews}
            keyExtractor={i => i._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: scale(16) }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.breakCard}>
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
        </View>

     
       
        {/* All Trending News */}
        <Text style={[styles.sectionTitle, { marginTop: scale(18) }]}>
          All Trending News
        </Text>
        <FlatList
          data={articles}
          keyExtractor={i => i._id}
          scrollEnabled={false} // we’re inside a ScrollView
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.rowCard}
              activeOpacity={0.9}
              onPress={() => handleArticlePress(item._id)} // ✅ no need to pass id
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
                  {item.description.replace(/<[^>]+>/g, '')}
                </Text>
                <View style={styles.metaRow}>
                  <Image
                    source={require('../../icons/comment.png')}
                    style={styles.metaIconImg}
                  />
                  <Text style={styles.metaText}>227K</Text>
                  <View style={{ width: 10 }} /> {/* small spacer */}
                  <Image
                    source={require('../../icons/eye.png')}
                    style={styles.metaIconImg}
                  />
                  <Text style={styles.metaText}>20</Text>
                </View>
              </View>
              <Image source={{ uri: item.image }} style={styles.rowThumb} />
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: scale(8) }} />}
        />
      </ScrollView>
    </View>
  );
};

export default TrendingScreen;
