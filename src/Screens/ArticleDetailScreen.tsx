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
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../style/ArticleDetailStyles';
import { apiPost, getApiWithOutQuery } from '../Utils/api/common';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  API_ADD_COMMENT,
  API_ARTICLES_LIST,
  API_COMMENTS_LIST,
  API_LIKES,
} from '../Utils/api/APIConstant';
import BottomSheet from '../Components/BottomSheet';

const HERO = require('../icons/news.png');
const BACK = require('../icons/back.png');

type Props = {
  navigation: any;
  route: { params: { id: string; slug: string } };
};

type Article = {
  createdBy: any;
  _id: string;
  slug: string;
  title: string;
  description: string;
  image?: string;
  createdAt?: string;
};

type ArticleResponse = {
  article: Article;
  counlike: number;
  comments: number;
};

const ArticleDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id } = route.params;
  const { slug } = route.params;
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const scale = (size: number) => (Dimensions.get('window').width / 375) * size;
  const handleSortChange = () => {
    const newOrder = sortOrder === 'latest' ? 'oldest' : 'latest';
    setSortOrder(newOrder);
  };

  const {
    data: payload,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['article', slug],
    queryFn: async (): Promise<ArticleResponse> => {
      const res = await getApiWithOutQuery({
        url: `${API_ARTICLES_LIST}/${slug}`,
      });
      console.log('ArticleDetailScreen', res.data);
      return res.data;
    },
  });
  const formatDateTime = (value: string | number | Date) => {
    const d = new Date(value);
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const h24 = d.getHours();
    const h12 = h24 % 12 || 12;
    const min = String(d.getMinutes()).padStart(2, '0');
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    return `${
      months[d.getMonth()]
    } ${d.getDate()}, ${d.getFullYear()} ${h12}:${min} ${ampm}`;
  };

  const article = payload?.article;
  const likeCount = payload?.counlike ?? 0;
  const commentsCount = payload?.comments ?? 0;

  const { data: commentData, refetch: refetchComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const res = await getApiWithOutQuery({
        url: `${API_COMMENTS_LIST}/${id}?sortOrder=desc`, // ✅ add sortOrder=desc
      });
      return (res.data.comments ?? []) as Array<{
        _id: string;
        name: string;
        content: string;
        createdAt: string;
        photo?: string;
      }>;
    },
    staleTime: 0, // Always consider data stale
  });

  const { mutate: AddComment, isPending: commenting } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiPost({ url: API_ADD_COMMENT, values: payload });
      return res.data;
    },
    onSuccess: () => {
      setCommentText('');
      refetchComments();
      setIsVisible(false);
    },

    onError: err => console.log('Failed to add comment', err),
  });
  const sortedComments = React.useMemo(() => {
    if (!commentData) return [];
    return [...commentData].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
    });
  }, [commentData, sortOrder]);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    AddComment({ articleId: id, content: commentText });
  };
  React.useEffect(() => {
    setLocalLikeCount(likeCount);
  }, [likeCount /*, payload?.userHasLiked*/]);

  // mutation (toggle like)
  const { mutate: toggleLike, isPending: likePending } = useMutation({
    mutationFn: async (like: boolean) => {
      const res = await apiPost({
        url: API_LIKES,
        values: { articleId: id },
      });
      console.log('toggleLike', res.data);
      return res.data;
    },
    onError: (_err, likeJustSet) => {
      setIsFav(!likeJustSet);
      setLocalLikeCount(c => c + (likeJustSet ? -1 : +1));
    },
  });

  // press handler
  const handleToggleFav = () => {
    const next = !isFav;
    setIsFav(next);
    setLocalLikeCount(c => c + (next ? 1 : -1));
    toggleLike(next);
  };
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} days ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} months ago`;
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} years ago`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent />
      <View style={{ height: insets.top }} />

      {/* App Bar */}
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
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(28) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <ImageBackground
          source={article?.image ? { uri: article.image } : HERO}
          style={styles.hero}
          imageStyle={styles.heroImg}
        />

        {/* Headline & meta */}
        <View style={styles.headerBlock}>
          <Text style={styles.headline}>
            {article?.title ?? (isLoading ? 'Loading…' : '—')}
          </Text>

          {/* ✅ Use a View, not a View inside Text */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.byAuthor}>
              {article?.createdBy
                ? `By ${article?.createdBy?.firstName || ''} ${
                    article?.createdBy?.lastName || ''
                  }`
                : 'By Unknown'}
            </Text>
            {/* Likes + Comments */}
            <View style={{ flexDirection: 'row' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 16,
                }}
              >
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={handleToggleFav}
                  disabled={likePending}
                >
                  <Image
                    source={
                      isFav
                        ? require('../icons/heart_red.png') // your red heart image
                        : require('../icons/heart.png') // your default/gray heart
                    }
                    style={styles.chatIcon}
                  />
                  <Text style={styles.likeCount}>{localLikeCount}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => setIsVisible(true)}
              >
                <Image
                  source={require('../icons/comment1.png')}
                  style={styles.chatIcon}
                />
                <Text style={styles.likeCount}>{commentData?.length ?? 0}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.dateline}>
            {article?.createdAt
              ? formatDateTime(article.createdAt)
              : 'September 13, 2025 4:16 AM'}
          </Text>
        </View>

        {/* Body */}
        <Text style={styles.body}>
          {(article?.description ?? '').replace(/<[^>]+>/g, '')}
        </Text>

        {/* Quote */}
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

      {/* Comments BottomSheet */}
      <BottomSheet visible={isVisible} onClose={() => setIsVisible(false)}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          Comments
        </Text>

        <TextInput
          placeholder="Add a comment"
          placeholderTextColor="#000"
          value={commentText}
          onChangeText={setCommentText}
          style={{
            height: scale(55),
            borderWidth: 1,
            borderColor: '#000',
            borderRadius: 8,
            paddingHorizontal: 5,
            color: '#000',
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
          onPress={handleAddComment}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {commenting ? 'Posting...' : 'Comment'}
          </Text>
        </TouchableOpacity>

        <View
          style={{
            borderWidth: 1,
            borderColor: '#E1E1E1',
            marginBottom: 16,
          }}
        />
        <View style={styles.filterWrap}>
          <Pressable style={styles.pillBtn} onPress={handleSortChange}>
            <Text style={styles.pillText}>
              {sortOrder === 'latest' ? 'Latest' : 'Oldest'}
            </Text>
            <Text style={styles.caret}>▾</Text>
          </Pressable>
        </View>
        <FlatList
          data={sortedComments}
          keyExtractor={item => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom }}
          renderItem={({ item }) => (
            <View
              style={{
                marginBottom: 16,
                padding: 12,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: '#000',
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
                  source={{ uri: item.photo }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    marginRight: 8,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 14 }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {getTimeAgo(item.createdAt)}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 14, lineHeight: 20, color: '#111' }}>
                {item.content}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#6B7280' }}>
              {isLoading ? 'Loading comments…' : 'No comments yet'}
            </Text>
          }
        />
      </BottomSheet>
    </View>
  );
};

export default ArticleDetailScreen;
