import React, { useMemo, useRef, useState } from 'react';
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
const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

const { width } = Dimensions.get('window');
// ---- assets ----
const BG = require('../../icons/bg.png');
const LOGO = require('../../icons/headerlogo.png');
const AVATAR = require('../../icons/user.png');
const COMMENT = require('../../icons/comment.png');
const EYE = require('../../icons/eye.png');

// helper: supports local assets OR URLs (future-proof)
const toSrc = (img: ImageSourcePropType | string) =>
  typeof img === 'string' ? { uri: img } : img;
type Row = {
  id: string;
  title: string;
  thumb: any;
  comments: number;
  views: string;
};

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
  id: string;
  title: string;
  thumb: ImageSourcePropType; // changed
  views: string;
comments: string;
};

const THUMBS = [
  require('../../icons/news1.png'),
  require('../../icons/news3.png'),
  require('../../icons/news2.png'),
];

const makeArticles = (prefix: string, count = 8): Article[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-${i + 1}`,
    title:
      i % 2 === 0
        ? 'Opposition Demands Transparency And Recents'
        : 'Central Bank Signals Pause On Rates',
    thumb: THUMBS[i % THUMBS.length],
    views: `${(2900 + i * 17).toLocaleString()}`,
   comments: `${80 + i}K+`,
  }));

const HomeScreen: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Top News');
  const listRef = useRef<FlatList<Article>>(null);

  const dataByTab = useMemo(
    () => ({
      'Top News': makeArticles('top'),
      'Latest News': makeArticles('latest'),
      Trending: makeArticles('trend'),
      'For You': makeArticles('foryou'),
    }),
    [],
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== activeSlide) setActiveSlide(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: scale(24) }}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== HEADER ===== */}
        <ImageBackground source={BG} style={styles.header} resizeMode="cover">
          <View style={styles.topBar}>
            {/* wordmark; replace with your logo asset or Text */}
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            <TouchableOpacity style={styles.avatarBtn} onPress={() => navigate('Login')}>
              <Image source={AVATAR} style={styles.avatar} />
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeBlock}>
            <Text style={styles.welcomeHeading}>Welcome back, Tyler!</Text>
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
            {TABS.map(t => {
              const active = t === activeTab;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setActiveTab(t)}
                  style={styles.tabBtn}
                >
                  <Text
                    style={[styles.tabText, active && styles.tabTextActive]}
                  >
                    {t}
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

        {/* <FlatList
          ref={listRef}
          data={dataByTab[activeTab]}
          keyExtractor={i => i.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigate('ArticleDetail' as never)}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    {' '}
                    <Image source={COMMENT} style={styles.metaIcon} />{' '}
                    {item.views}
                  </Text>
                  <Text style={styles.metaText}>
                    {' '}
                    <Image source={EYE} style={styles.metaIcon} />{' '}
                    {item.readers}
                  </Text>
                </View>
              </View>
              <Image source={toSrc(item.thumb)} style={styles.cardThumb} />
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: scale(8) }} />}
        /> */}
        <FlatList
          ref={listRef}
          data={dataByTab[activeTab]}
          keyExtractor={i => i.id}
          scrollEnabled={false} // we’re inside a ScrollView
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.rowCard} activeOpacity={0.9}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.metaRow}>
                  <Image
                    source={require('../../icons/comment.png')}
                    style={styles.metaIconImg}
                  />
                  <Text style={styles.metaText}>
                    {item.comments.toLocaleString()}
                  </Text>
                  <View style={{ width: 10 }} /> {/* small spacer */}
                  <Image
                    source={require('../../icons/eye.png')}
                    style={styles.metaIconImg}
                  />
                  <Text style={styles.metaText}>{item.views}</Text>
                </View>
              </View>
              <Image source={item.thumb} style={styles.rowThumb} />
            </TouchableOpacity>
          )}
          ListFooterComponent={<View style={{ height: scale(8) }} />}
        />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
