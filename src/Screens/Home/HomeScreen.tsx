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
  NativeScrollEvent,
  NativeSyntheticEvent,
  ImageSourcePropType,
} from 'react-native';
import { styles } from '../../style/HomeStyles';
import { navigate } from '../../Navigators/utils';
import { useAuth } from '../Auth/AuthContext';
import ShowToast from '../../Utils/ShowToast';
import { useQuery } from '@tanstack/react-query';
import { getApiWithOutQuery } from '../../Utils/api/common';
import {  API_CATEGORIES } from '../../Utils/api/APIConstant';
const scale = (size: number) => (Dimensions.get('window').width / 375) * size;
import HtmlRenderer from '../../Components/HtmlRenderer';
const { width } = Dimensions.get("window");
// ---- assets ----
const BG = require('../../icons/bg.png');
const LOGO = require('../../icons/headerlogo.png');
const AVATAR = require('../../icons/user.png');

// helper: supports local assets OR URLs (future-proof)
const toSrc = (img: ImageSourcePropType | string) =>
  typeof img === 'string' ? { uri: img } : img;

const TRENDING = [
  {
    id: 't1',
    title: 'Government Launches Economic Reform Plan',
    image: require('../../icons/news.png'),
  },
  {
    id: 't2',
    title: 'New Breakthrough in Renewable Energy',
    image: require('../../icons/news.png'),
  }, // <- add this file
  {
    id: 't3',
    title: 'Global Markets Rally as Inflation Cools',
    image: require('../../icons/news.png'),
  }, // <- add this file
];

const TABS = ['Top News', 'Latest News', 'Trending', 'For You'] as const;

// Use local thumbs
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

const HomeScreen: React.FC = () => {
  const { session } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>();
  const listRef = useRef<FlatList<Article>>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== activeSlide) setActiveSlide(index);
  };
  // const { session, loading } = useAuth();
  // const {
  //   data: articles,
  //   isLoading,
  //   isError,
  //   error,
  // } = useQuery({
  //   queryKey: ['articles'],
  //   queryFn: async () => {
  //     const res = await getApiWithOutQuery({ url: API_ARTICLES_LIST });
  //     console.log('Articles API response ===>', res.data.articles);
  //     return res.data?.articles ?? []; // safe fallback
  //   },
  // });
  
  const {
    data: categoryData,
    isLoading: isCatLoading,
    isError: isCatError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getApiWithOutQuery({
        url: API_CATEGORIES,
      });
      return (
        res.data?.categories?.filter((c: any) => c.status === 'active') ?? []
      );
    },
  });

  useEffect(() => {
    if (categoryData && categoryData.length > 0 && !activeTab) {
      setActiveTab(categoryData[0].title);
      setCategoryId(categoryData[0]._id);
    }
  }, [categoryData]);


  const { data: articleData = [] } = useQuery({
    queryKey: ['articles', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const res = await getApiWithOutQuery({
        url: `/users/articles-by-category?categoryId=${categoryId}`,
      });
      return res.data?.data ?? [];
    },
    enabled: !!categoryId, 
  });

  const handleAvatarPress = () => {
    if (!session?.accessToken) {
      console.log('User not logged in → Login');
      navigate('Login' as never);
    } else {
      console.log('User logged in → EditProfile');
      navigate('More' as never); // change to your profile screen
    }
  };

  const handleArticlePress = (id: string) => {
    if (!session?.accessToken) {
      ShowToast('Please login to read this article', 'error');
      navigate('Login' as never);
      return;
    }
    navigate('ArticleDetail' as never, { id } as never);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: scale(55) }}
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

          {/* ===== TRENDING CAROUSEL ===== */}
          <View style={styles.trendingHeader}>
            <Text style={styles.trendingTitle}>Trending news</Text>
            <TouchableOpacity
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={TRENDING}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={width}
            decelerationRate="fast"
            onMomentumScrollEnd={onMomentumEnd}
            renderItem={({ item }) => (
              <View style={styles.slideWrap}>
                <ImageBackground
                  source={toSrc(item.image)}
                  style={styles.slideCard}
                  imageStyle={styles.slideImage}
                >
                  {/* dark overlay */}
                  <View style={styles.slideOverlay} />
                  <Text style={styles.slideCaption} numberOfLines={2}>
                    {item.title}
                  </Text>
                </ImageBackground>
              </View>
            )}
          />

          {/* dots */}
          <View style={styles.dotsRow}>
            {TRENDING.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeSlide && styles.dotActive]}
              />
            ))}
          </View>
        </ImageBackground>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recommended</Text>
        </View>
        {/* ===== CONTENT ===== */}

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(categoryData || []).map((cat:any) => {
              const active = cat.title === activeTab;
              return (
                <TouchableOpacity
                  key={cat._id}
                  onPress={() => {
                    setActiveTab(cat.title);
                    setCategoryId(cat._id);
                  }}
                  style={styles.tabBtn}
                >
                  <Text
                    style={[styles.tabText, active && styles.tabTextActive]}
                  >
                    {cat.title}
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
        <FlatList
          ref={listRef}
          data={articleData}
          keyExtractor={i => i._id}
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
                  <Text style={styles.metaText}>227K</Text>
                  <View style={{ width: 10 }} /> 
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

export default HomeScreen;
