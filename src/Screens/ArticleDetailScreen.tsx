import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../style/ArticleDetailStyles';
import { getApiWithOutQuery } from '../Utils/api/common';
import { useQuery } from '@tanstack/react-query';
import { API_ARTICLES_LIST } from '../Utils/api/APIConstant';
import BottomSheet from '../Components/BottomSheet';

const HERO = require('../icons/news.png'); // hero image
const BACK = require('../icons/back.png'); // left arrow
// const LIKE   = require('../../icons/heart.png');
// const CHAT   = require('../../icons/chat.png');
// const SHARE  = require('../../icons/share.png');
// const SAVE   = require('../../icons/bookmark.png');

const CATEGORIES = [
  'All',
  'World',
  'Business',
  'Politics',
  'Tech',
  'Health',
  'Sports',
];

type Props = { navigation: any; route: { params: { id: string } } };

const ArticleDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('All');
  const [isVisible, setIsVisible] = useState(false);
  const [comment, setComment] = useState('');
  const scale = (size: number) => (Dimensions.get('window').width / 375) * size;
  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const res = await getApiWithOutQuery({
        url: `${API_ARTICLES_LIST}/${id}`,
      });

      return res.data;
    },
  });

  const comments = [
    {
      id: '1',
      user: 'Discover Chateeze Premium',
      time: '3 days ago',
      text: 'New York, Sept. 12, 2025 – International markets experienced uncertainty today as world leaders gathered...',
      likes: 245,
      replies: 56,
    },
  ];
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent />
      {/* Safe top spacer */}
      <View style={{ height: insets.top }} />

      {/* ---------- App Bar ---------- */}
      <View style={styles.appBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack?.()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          style={styles.backBtn}
        >
          <Image source={BACK} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.appTitle} numberOfLines={1}>
          Aecalis News
        </Text>
        <View style={{ width: scale(24) }} />
        {/* balance for centered title */}
      </View>

      {/* ---------- Horizontal categories (scrollable) ---------- */}

      {/* ---------- Content ---------- */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(28) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <ImageBackground
          source={article?.image ? { uri: article.image } : HERO} // fallback local image
          style={styles.hero}
          imageStyle={styles.heroImg}
        />

        {/* Headline & byline */}
        <View style={styles.headerBlock}>
          <Text style={styles.headline}>{article?.title}</Text>

          <Text style={styles.byline}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
               
              }}
            >
              {/* Author (Left) */}
              <Text style={styles.byAuthor}>By Davis Lawder</Text>

              {/* Likes + Comments (Right) */}
              <View style={{ flexDirection: 'row',marginLeft:'40%' }}>
                {/* Likes */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                >
                  <Image
                    source={require('../icons/heart.png')}
                    style={styles.chatIcon}
                  />
                  <Text style={styles.likeCount}>37.5k</Text>
                </TouchableOpacity>

                {/* Comments */}
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => setIsVisible(true)}
                >
                  <Image
                    source={require('../icons/comment1.png')}
                    style={styles.chatIcon}
                  />
                  <Text style={styles.likeCount}>120</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Text>
          <Text style={styles.dateline}>September 13, 2025 4:16 AM</Text>
        </View>

        {/* First paragraphs */}
        <Text style={styles.body}>
          {article?.description?.replace(/<[^>]+>/g, '') || ''}
        </Text>

        {/* Interaction strip */}
        {/* <View style={styles.actionStrip}>
          <TouchableOpacity style={styles.stat}>
            <Image source={LIKE} style={styles.statIcon} />
            <Text style={styles.statText}>37.6K</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat}>
            <Image source={CHAT} style={styles.statIcon} />
            <Text style={styles.statText}>159</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat}>
            <Image source={SHARE} style={styles.statIcon} />
            <Text style={styles.statText}>920</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat}>
            <Image source={SAVE} style={styles.statIcon} />
          </TouchableOpacity>
        </View> */}

        {/* Divider bar */}
        {/* <View style={styles.smallIndicator} /> */}

        {/* Remaining paragraphs */}

        {/* Quote block */}
        <View style={styles.quoteWrap}>
          <View style={styles.quoteBar} />
          <Text style={styles.quoteText}>
            “Our goal is not to punish nations unfairly,” said one senior U.S.
            diplomat during a press briefing. “However, we must ensure that no
            country benefits economically from practices that violate
            international sanctions and threaten global security.”
          </Text>
        </View>
      </ScrollView>
      <BottomSheet visible={isVisible} onClose={() => setIsVisible(false)}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Comments
        </Text>

        {/* Input */}
        <TextInput
          placeholder="Add a comment"
          value={comment}
          onChangeText={setComment}
          style={{
            height: scale(55),
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 8,
            paddingHorizontal: 5,
            marginBottom: 12,
            backgroundColor: '#F0F6FF',
          }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#0A1F44',
            height: scale(40),
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Comment</Text>
        </TouchableOpacity>
        <View
          style={{
            borderWidth: 1,
            borderColor: '#E5E7EB',
            paddingHorizontal: 12,
            marginBottom: 16,
          }}
        />
        {/* Comment list */}
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom }}
          renderItem={({ item }) => (
            <View
              style={{
                marginBottom: 16,
                padding: 12,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: '#E5E7EB',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <Image
                  source={{ uri: 'https://i.pravatar.cc/100' }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    marginRight: 8,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 14 }}>
                    {item.user}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {item.time}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 14, lineHeight: 20, color: '#111' }}>
                {item.text}
              </Text>

              {/* Likes / Replies */}
            </View>
          )}
        />
      </BottomSheet>
    </View>
  );
};

export default ArticleDetailScreen;
