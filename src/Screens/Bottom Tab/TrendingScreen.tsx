import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../../style/TrendingStyles';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import { API_ARTICLES_LIST, API_CATEGORIES } from '../../Utils/api/APIConstant';
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

const TrendingScreen: React.FC = () => {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('all');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const rows = useMemo(() => makeRows(12), []);
  const handleArticlePress = (id: string) => {
    if (!session?.accessToken) {
      ShowToast('Please login to read this article', 'error');
      navigate('Login' as never);
      return;
    }
    navigate('ArticleDetail' as never, { id } as never); // ✅ pass article id
  };
  // const {
  //   data: articles,
  //   isLoading,
  //   isError,
  //   error,
  // } = useQuery({
  //   queryKey: ['articles'],
  //   queryFn: async () => {
  //     const res = await getApiWithOutQuery({ url: API_ARTICLES_LIST });
  //     return res.data?.articles ?? []; // safe fallback
  //   },
  // });
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
          ? `http://192.168.1.36:9991/api/users/articles-by-category?categoryId=${categoryId}`
          : API_ARTICLES_LIST;
      const res = await getApiWithOutQuery({ url });
      return res.data?.articles ?? res.data?.data ?? [];
    },
    enabled: !!tabs.length, // wait for categories to load
  });
  return (
    <View style={styles.container}>
      <View style={{ height: insets.top }} />
      <View style={styles.topBar}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <View style={styles.avatarWrap}>
          <Image source={AVATAR} style={styles.avatar} />
        </View>
      </View>

      {/* Category tabs */}
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
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{c.title}</Text>
              <View style={[styles.tabBar, isActive ? styles.tabBarActive : styles.tabBarGhost]} />
            </TouchableOpacity>
          );
        })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(24) }}
      >
        {/* Breaking News */}
        <Text style={styles.sectionTitle}>Breaking News</Text>
        <FlatList
          data={BREAKING}
          keyExtractor={i => i.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: scale(16) }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.breakCard}>
              <ImageBackground
                source={item.image}
                style={styles.breakImage}
                imageStyle={styles.breakImageRadius}
              />
              <Text style={styles.breakCaption} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
        />

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
