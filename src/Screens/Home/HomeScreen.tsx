import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ImageSourcePropType,
} from 'react-native';
import { styles } from '../../style/HomeStyles';
import { navigate } from '../../Navigators/utils';
import { useAuth } from '../Auth/AuthContext';
import ShowToast from '../../Utils/ShowToast';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import {
  API_ARTICLES_LIST,
  API_CATEGORIES,
  API_GET_ARTICLES_BY_TYPE,
} from '../../Utils/api/APIConstant';
import HtmlRenderer from '../../Components/HtmlRenderer';

const { width } = Dimensions.get('window');

// helper for images (local or URL)
const toSrc = (img: ImageSourcePropType | string) =>
  typeof img === 'string' ? { uri: img } : img;

// ---- ASSETS ----
const BG = require('../../icons/bg.png');
const LOGO = require('../../icons/headerlogo.png');
const AVATAR = require('../../icons/user.png');

type Article = {
  _id: string;
  title: string;
  description: string;
  image: string;
  commentCount: number;
  viewCount: number;
  articleType?: string;
  articleCategoryId?: { title: string };
  createdAt?: string;
};

const HomeScreen: React.FC = () => {
  const { session } = useAuth();

  // local state
  const [activeSlide, setActiveSlide] = useState(0);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [topNews, setTopNews] = useState<Article[]>([]);
  const [latestNews, setLatestNews] = useState<Article[]>([]);
  const [trendingNews, setTrendingNews] = useState<Article[]>([]);
  const [selectedType, setSelectedType] = useState('top-news');

  const listRef = useRef<FlatList<Article>>(null);

  // === FETCH MAIN ARTICLES ===
  const { data: allArticles = [] } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_ARTICLES_LIST });
      return res.data?.articles ?? [];
    },
  });

  // === FETCH CATEGORIES ===
  const { data: categoryData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({ url: API_CATEGORIES });
      return (
        res.data?.categories?.filter((c: any) => c.status === 'active') ?? []
      );
    },
  });

  // === FETCH ARTICLES BY TYPE ===
  const getData = async (type: string, setter: (data: any) => void) => {
    try {
      const res = await getApiWithOutQuery({
        url: API_GET_ARTICLES_BY_TYPE + type,
      });
      if (res?.data?.articles) {
        setter(res.data.articles);
      } else {
        setter([]);
      }
    } catch (err) {
      console.log(`Error fetching ${type}:`, err);
      setter([]);
    }
  };

  useEffect(() => {
    const newsTypes = [
      { type: '/breaking', setter: setBreakingNews },
      { type: '/top-news', setter: setTopNews },
      { type: '/latest', setter: setLatestNews },
      { type: '/trending', setter: setTrendingNews },
    ];
    newsTypes.forEach(({ type, setter }) => getData(type, setter));
  }, []);

  // === TAB FILTER ===
  const tabArticles = useMemo(
    () =>
      allArticles.filter(
        (a: { articleType: string }) => a.articleType === selectedType,
      ),
    [allArticles, selectedType],
  );

  // === HANDLE SLIDE SCROLL ===
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveSlide(index);
  };

  // === ACTIONS ===
  const handleAvatarPress = () => {
    if (!session?.accessToken) navigate('Login' as never);
    else navigate('More' as never);
  };

  const handleArticlePress = (id: string) => {
    if (!session?.accessToken) {
      ShowToast('Please login to read this article', 'error');
      navigate('Login' as never);
      return;
    }
    navigate('ArticleDetail' as never, { id } as never);
  };

  // === STATIC TAB TYPES ===
  const TABS = [
    { label: 'Top News', type: 'top-news' },
    { label: 'Latest News', type: 'latest' },
    { label: 'Trending', type: 'trending' },
    { label: 'Breaking', type: 'breaking' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <ImageBackground source={BG} style={styles.header} resizeMode="cover">
          <View style={styles.topBar}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={handleAvatarPress}
            >
              <Image source={AVATAR} style={styles.avatar} />
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeBlock}>
            <Text style={styles.welcomeHeading}>
              Welcome back, {session?.user?.name ?? 'Reader'}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Discover a world of news that matters to you
            </Text>
          </View>

          {/* === TRENDING NEWS CAROUSEL === */}
          <View style={styles.trendingHeader}>
            <Text style={styles.trendingTitle}>Trending news</Text>
            <TouchableOpacity
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
              onPress={() => navigate('TrendingNews' as never)}
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={Array.isArray(trendingNews) ? trendingNews : []}
            keyExtractor={item => item._id}
            horizontal
            pagingEnabled
            snapToInterval={width}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumEnd}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleArticlePress(item._id)}>
                <View style={[styles.slideWrap, { width }]}>
                  <ImageBackground
                    source={toSrc(item.image)}
                    style={styles.slideCard}
                    imageStyle={styles.slideImage}
                  >
                    <View style={styles.slideOverlay} />
                    <Text style={styles.slideCaption} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </ImageBackground>
                </View>
              </TouchableOpacity>
            )}
          />

          {/* DYNAMIC DOTS */}
          <View style={styles.dotsRow}>
            <View style={styles.dotsRow}>
              {(trendingNews ?? []).map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeSlide && styles.dotActive]}
                />
              ))}
            </View>
          </View>
        </ImageBackground>

        {/* RECOMMENDED SECTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recommended</Text>
        </View>

        {/* CATEGORY TABS */}
        <View style={styles.tabsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TABS.map(tab => {
              const active = tab.type === selectedType;
              return (
                <TouchableOpacity
                  key={tab.type}
                  onPress={() => setSelectedType(tab.type)}
                  style={styles.tabBtn}
                >
                  <Text
                    style={[styles.tabText, active && styles.tabTextActive]}
                  >
                    {tab.label}
                  </Text>
                  {active ? (
                    <View style={styles.tabIndicator} />
                  ) : (
                    <View style={styles.tabIndicatorGhost} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ARTICLES LIST */}
        <FlatList
          data={tabArticles}
          keyExtractor={item => item._id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.rowCard}
              activeOpacity={0.9}
              onPress={() => handleArticlePress(item._id)}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <HtmlRenderer html={item.description} limit={60} />
                <View style={styles.metaRow}>
                  <Image
                    source={require('../../icons/comment.png')}
                    style={styles.metaIconImg}
                  />
                  <Text style={styles.metaText}>{item.commentCount}</Text>
                  <View style={{ width: 10 }} />
                  <Image
                    source={require('../../icons/eye.png')}
                    style={styles.metaIconImg}
                  />
                  <Text style={styles.metaText}>{item.viewCount}+</Text>
                </View>
              </View>
              <Image source={{ uri: item.image }} style={styles.rowThumb} />
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: 16 }} />}
        />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
