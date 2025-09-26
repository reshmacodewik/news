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
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState('All');

  const rows = useMemo(() => makeRows(12), []);

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(c => {
            const isActive = active === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setActive(c)}
                style={styles.tabBtn}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.tabText, isActive && styles.tabTextActive]}
                >
                  {c}
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
          data={rows}
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

export default TrendingScreen;
