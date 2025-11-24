import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Animated,
} from 'react-native';
import { styles } from '../../style/HomeStyles';
import { navigate } from '../../Navigators/utils';
import { useAuth } from '../Auth/AuthContext';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import {
  API_ARTICLES_CATEGORIES,
  API_ARTICLES_LIST,
  API_GET_ARTICLES_BY_TYPE,
} from '../../Utils/api/APIConstant';
import Header from '../../Components/Header';
import { useFocusEffect } from '@react-navigation/native';
import { useDomainByType } from '../../Hook/useDomainByType';
import NewsCard from '../../Components/NewsCard';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
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
  slug: string;
  viewingType?: 'free' | 'register' | 'premium';
};

const HomeScreen: React.FC = () => {
  const { session } = useAuth();
  const { domain } = useDomainByType('news');
  const [activeSlide, setActiveSlide] = useState(0);
  const [trendingNews, setTrendingNews] = useState<Article[]>([]);
  const [selectedType, setSelectedType] = useState('top-news');
  const [showTrending, setShowTrending] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const { theme, colors } = useTheme();
  const scrollY = useRef(new Animated.Value(0)).current;
  // === FETCH ALL ARTICLES ===
  const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  refetch: refetchAllArticles,
} = useInfiniteQuery({
  queryKey: ['articles', domain?.type, selectedType],

  initialPageParam: 1,   // FIXES your TypeScript error

  queryFn: async ({ pageParam }) => {
    const res = await getApiWithOutQuery({
      url: `${API_ARTICLES_LIST}/${domain?.type}?type=${selectedType}&page=${pageParam}&limit=10`,
    });

    return {
      articles: res.data?.articles ?? [],
      nextPage: pageParam + 1,
      totalPages: res.data?.pagination?.totalPages,
    };
  },

  getNextPageParam: lastPage => {
    return lastPage.nextPage <= lastPage.totalPages
      ? lastPage.nextPage
      : undefined;
  },
});

  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({
        url: API_ARTICLES_CATEGORIES,
      });
      return res.data?.articles ?? []; // categories list
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      refetchAllArticles();
    }, []),
  );

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
    const newsTypes = [{ type: '/trending', setter: setTrendingNews }];
    newsTypes.forEach(({ type, setter }) => getData(type, setter));
  }, []);

  // === TAB FILTER ===
const tabArticles = useMemo(() => {
  return data?.pages.flatMap(p => p.articles) ?? [];
}, [data]);

  // Helper to get category title
  const getCategoryTitle = (articleCategoryId: any) => {
    if (!articleCategoryId) return 'General';
    if (typeof articleCategoryId === 'object' && articleCategoryId.title)
      return articleCategoryId.title;

    const match = categories.find((c: any) => c._id === articleCategoryId);
    return match?.title || 'General';
  };

  // === HANDLE SLIDE SCROLL ===
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveSlide(index);
  };

  const handleArticlePress = (id: string, slug: string) => {
    navigate('ArticleDetail' as never, { id, slug } as never);
  };

  useFocusEffect(() => {
    StatusBar.setBarStyle('light-content'); // white text/icons
    StatusBar.setBackgroundColor('transparent'); // optional: blend with background image
    StatusBar.setTranslucent(true);
  });

  // === STATIC TAB TYPES ===
  const TABS = [
    { label: 'Top News', type: 'top-news' },
    { label: 'Latest News', type: 'latest' },
    { label: 'Trending', type: 'trending' },
    { label: 'Breaking', type: 'breaking' },
  ];
  const lastOffset = useRef(0);
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = e.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastOffset.current;
    if (diff > 10 && showTrending) {
      // scrolling down -> hide
      setShowTrending(false);
    } else if (diff < -10 && !showTrending) {
      // scrolling up -> show
      setShowTrending(true);
    }
    lastOffset.current = currentOffset;
  };
  return (
    <Animated.ScrollView
      bounces={false}
      alwaysBounceVertical={false}
      style={[styles.content, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 80 }}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ImageBackground source={BG} style={styles.header} resizeMode="cover">
          <Header
            logoSource={LOGO}
            avatarSource={AVATAR}
            guestRoute="More"
            authRoute="More"
            isHome={true}
          />
          <View style={styles.welcomeBlock}>
            <Text style={[styles.welcomeHeading]}>
              Welcome back, {session?.user?.name ?? 'Reader'}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Discover a world of news that matters to you
            </Text>
          </View>

          {/* === TRENDING NEWS CAROUSEL === */}
          {Array.isArray(trendingNews) && trendingNews.length > 0 && (
            <View style={styles.trendingHeader}>
              <Text style={styles.trendingTitle}>Trending news</Text>
            </View>
          )}

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
              <TouchableOpacity
                onPress={() => handleArticlePress(item._id, item.slug)}
              >
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recommended
          </Text>
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
                    style={[
                      styles.tabText,
                      active && styles.tabTextActive,
                      active ? { color: colors.tabtext } : { color: '#777' },
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {active ? (
                    <View
                      style={[
                        styles.tabIndicator,
                        { backgroundColor: colors.tabtext },
                      ]}
                    />
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
            <NewsCard
              category={
                (
                  item.articleCategoryId.title ||
                  getCategoryTitle(item.articleCategoryId)
                )
                  .charAt(0)
                  .toUpperCase() +
                (
                  item.articleCategoryId.title ||
                  getCategoryTitle(item.articleCategoryId)
                ).slice(1)
              }
              title={item.title}
              description={item.description}
              image={item.image}
              commentCount={item.commentCount}
              viewCount={item.viewCount}
              onPress={() => handleArticlePress(item._id, item.slug)}
            />
          )}
            onEndReached={() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }}
  onEndReachedThreshold={0.3}

          ListEmptyComponent={() => (
            
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 40,
              }}
            >
              <Text style={{ fontSize: 16, color: '#777' }}>
                No data available
              </Text>
            </View>
          )}
          ListFooterComponent={<View style={{ height: 16 }} />}
        />
      </View>
   

    </Animated.ScrollView>
  );
};

export default HomeScreen;
