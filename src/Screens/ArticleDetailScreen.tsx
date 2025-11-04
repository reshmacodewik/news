import React, { useCallback, useEffect, useState } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../style/ArticleDetailStyles';
import { apiPost, getApiWithOutQuery } from '../Utils/api/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  API_ADD_COMMENT,
  API_ARTICLES_DETAILS,
  API_COMMENTS_LIST,
  API_DELETE_COMMENT,
  API_LIKES,
  API_UPDATE_COMMENT,
} from '../Utils/api/APIConstant';
import BottomSheet from '../Components/BottomSheet';
import { useAuth } from './Auth/AuthContext';
import PaywallCard from '../Components/PaywallCard';
import { formatDateTime, getTimeAgo } from '../libs/helper';
import ShowToast from '../Utils/ShowToast';
import { navigate } from '../Navigators/utils';
import RenderHTML from 'react-native-render-html';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const HERO = require('../icons/news.png');
const BACK = require('../icons/back.png');

type Props = {
  navigation: any;
  route: { params: { id: string; slug: string } };
};

type Article = {
  author: any;
  _id: string;
  slug: string;
  title: string;
  shortContent: string;
  description: string;
  image?: string;
  createdAt?: string;
  commentCount?: number;
  likeCount?: number;
  viewingType?: 'free' | 'register' | 'premium';
  isLiked?: boolean; // 👈 add this
};

const ArticleDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id, slug } = route.params;
  const { session } = useAuth();
  console.log(session);
  const insets = useSafeAreaInsets();
  const currentUserId = session?.user?.id || session?.user?._id;
  const currentUserName = session?.user?.name?.trim().toLowerCase();
  const [isVisible, setIsVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { theme, colors } = useTheme();
  const queryClient = useQueryClient();
  const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

  const handleSortChange = () => {
    const newOrder = sortOrder === 'latest' ? 'oldest' : 'latest';
    setSortOrder(newOrder);
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['article-details', slug],
    queryFn: async (): Promise<Article> => {
      const res = await getApiWithOutQuery({
        url: `${API_ARTICLES_DETAILS}/${slug}`,
      });
      return {
        ...res.data.article,
        likeCount: res.data.likeCount,
        commentCount: res.data.commentCount,
        isLiked: res.data.isLiked,
      };
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [slug]),
  );
  const isLoggedIn = !!session?.accessToken; // or check from Redux/store
const isSubscribed =
  session?.user?.plan === 'premium' ||
  session?.user?.isPremium ||
  session?.user?.subscription === 'premium' ||
  session?.user?.planType === 'premium' ||
  session?.user?.role === 'premium' ||
  session?.user?.is_premium === true;


  const likeCount = data?.likeCount ?? 0;
  console.log('helooo', likeCount);
  const fetchedCommentCount = data?.commentCount ?? 0;
  console.log('helooo', fetchedCommentCount);

  const { data: commentData, refetch: refetchComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const res = await getApiWithOutQuery({
        url: `${API_COMMENTS_LIST}/${id}?sortOrder=desc`,
      });
      return (res.data.comments ?? []) as Array<{
        _id: string;
        name: string;
        content: string;
        createdAt: string;
        photo?: string;
        authorId: string;
        author?: { id?: string; _id?: string }; // ✅ allow both
        user?: { id?: string; _id?: string };
      }>;
    },
    staleTime: 0,
  });

  const article = data;

  const { mutate: AddComment, isPending: commenting } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiPost({ url: API_ADD_COMMENT, values: payload });
      return res.data;
    },
    onSuccess: () => {
      setCommentText('');
      setIsVisible(false);
      refetchComments();
      // Also refresh article details to update commentCount
      queryClient.invalidateQueries({ queryKey: ['article-details', slug] });
    },
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
    if (!session?.accessToken) {
      ShowToast('Login Required', 'error');
      navigate('Login');
      return;
    }
    if (!commentText.trim()) return;
    AddComment({ articleId: id, content: commentText });
  };

  const { mutate: toggleLike, isPending: likePending } = useMutation({
    mutationFn: async () => {
      const res = await apiPost({
        url: API_LIKES,
        values: { articleId: id },
      });
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['article-details', slug] });
      const prev = queryClient.getQueryData(['article-details', slug]);
      const previousFav = isFav; // ✅ capture before toggle

      // Optimistic UI
      setIsFav(!previousFav);
      setLocalLikeCount(count => count + (previousFav ? -1 : 1));

      return { prev, previousFav };
    },
    onError: (error, _, context) => {
      if (context?.prev)
        queryClient.setQueryData(['article-details', slug], context.prev);
      // revert
      setIsFav(context?.previousFav ?? false);
      setLocalLikeCount(count => count + (context?.previousFav ? 1 : -1));
      ShowToast('Failed to update like', 'error');
    },
    onSuccess: res => {
      // 1️⃣ Update the article detail cache instantly
      queryClient.setQueryData(['article-details', slug], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          likeCount: res.data?.likeCount ?? old.likeCount,
          isLiked: res.data?.isLiked ?? old.isLiked,
        };
      });

      // 2️⃣ If you have an article list query, update its cache too
      queryClient.setQueryData(['articles'], (oldList: any) => {
        if (!oldList) return oldList;
        return oldList.map((article: any) =>
          article._id === id
            ? {
                ...article,
                likeCount: res.data?.likeCount ?? article.likeCount,
                isLiked: res.data?.isLiked ?? article.isLiked,
              }
            : article,
        );
      });

      // 3️⃣ Optionally invalidate article list to sync from server
      queryClient.invalidateQueries({ queryKey: ['articles'] });

      ShowToast(
        res.data?.isLiked
          ? 'Removed from favorites successfully.'
          : 'Added to favorites successfully.',
        'success',
      );
    },
  });
  useEffect(() => {
    if (data) {
      setIsFav(data.isLiked ?? false);
      setLocalLikeCount(data.likeCount ?? 0);
    }
  }, [data]);

  const handleToggleFav = async () => {
    if (!session?.accessToken) {
      ShowToast('Login Required', 'error');
      navigate('Login');
      return;
    }

    if (!data?._id) return;

    // Optimistic UI update
    const newLiked = !isFav;
    const newCount = localLikeCount + (newLiked ? 1 : -1);
    setIsFav(newLiked);
    setLocalLikeCount(newCount);

    try {
      const res = await apiPost({
        url: API_LIKES, // ✅ your API endpoint
        values: { articleId: data._id },
      });
      console.log('Like toggle response:', res.values);
      const serverData = res.data?.data; // contains likeCount & isLiked

      // Update UI from server response
      if (serverData) {
        setIsFav(serverData.isLiked);
        setLocalLikeCount(serverData.likeCount);
      }
      refetch(); // ✅ re-fetch article to stay in sync
    } catch (err) {
      console.error('Like toggle error:', err);
      // Rollback if API fails
      setIsFav(!newLiked);
      setLocalLikeCount(localLikeCount);
      ShowToast('Failed to update like', 'error');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await apiPost({
        url: API_DELETE_COMMENT.replace(':id', commentId),
        values: {},
      });

      if (res?.success || res?.status) {
        ShowToast('Comment deleted successfully', 'success');

        // ✅ Instantly update article commentCount cache
        queryClient.setQueryData(['article-details', slug], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            commentCount: Math.max((old.commentCount ?? 1) - 1, 0),
          };
        });

        // ✅ Refresh comment list to remove deleted one
        await refetchComments();
      } else {
        ShowToast('Failed to delete comment', 'error');
      }
    } catch (error) {
      console.error('Delete comment error:', error);
      ShowToast('Something went wrong', 'error');
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) {
      ShowToast('Comment cannot be empty', 'error');
      return;
    }

    try {
      const res = await apiPost({
        url: API_UPDATE_COMMENT.replace(':id', commentId),
        values: { content: editContent },
      });

      if (res?.success || res?.status) {
        ShowToast('Comment updated successfully', 'success');
        setEditingCommentId(null);
        setEditContent('');
        await refetchComments(); // ✅ Always re-fetch after update
      } else {
        ShowToast('Failed to update comment', 'error');
      }
    } catch (error) {
      console.error('Update comment error:', error);
      ShowToast('Something went wrong', 'error');
    }
  };

  const viewingType = data?.viewingType;
  const token = session?.accessToken;
  const needsLogin =
    (viewingType === 'register' || viewingType === 'premium') && !token;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" translucent />
      <View style={{ height: insets.top }} />

      {/* App Bar */}
      <View style={[styles.appBar, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack?.()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          style={[styles.backBtn]}
        >
          <Image
            source={BACK}
            style={[styles.backIcon, { tintColor: colors.text }]}
          />
        </TouchableOpacity>
        <Text
          style={[styles.appTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          Arcalis News
        </Text>
        <View style={{ width: scale(24) }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(28) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        {isLoading ? (
          <View
            style={[
              styles.hero,
              {
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f2f2f2',
              },
            ]}
          >
            <ActivityIndicator size="large" color="#0A1F44" />
          </View>
        ) : (
          <ImageBackground
            source={data?.image ? { uri: data.image } : HERO}
            style={styles.hero}
            imageStyle={styles.heroImg}
          />
        )}

        {/* Headline & meta */}
        <View style={styles.headerBlock}>
          <Text
            style={[
              styles.headline,
              {
                color:
                  theme === 'dark'
                    ? colors.headingtext // use dark mode heading color
                    : '#000', // black for light mode
              },
            ]}
          >
            {data?.title ?? (isLoading ? 'Loading…' : '—')}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.byAuthor}>
              {data?.author ? `By ${data?.author}` : 'By Unknown'}
            </Text>
            {/* Likes + Comments */}
            <View style={{ flexDirection: 'row' }}>
              {/* ❤️ Likes */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 16,
                }}
                onPress={handleToggleFav}
                disabled={likePending}
              >
                <Image
                  source={
                    isFav
                      ? require('../icons/heart_red.png')
                      : require('../icons/heart.png')
                  }
                  style={[styles.chatIcon, { tintColor: colors.text }]}
                />
                {likeCount > 0 && (
                  <Text style={[styles.likeCount, { color: colors.text }]}>
                    {likeCount}
                  </Text>
                )}
              </TouchableOpacity>

              {/* 💬 Comments */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center' }}
                onPress={() => setIsVisible(true)}
              >
                <Image
                  source={require('../icons/comment1.png')}
                  style={[styles.chatIcon, { tintColor: colors.text }]}
                />
                {fetchedCommentCount > 0 && (
                  <Text style={[styles.likeCount, { color: colors.text }]}>
                    {fetchedCommentCount}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.dateline}>
            {data?.createdAt ? formatDateTime(data.createdAt) : ''}
          </Text>
        </View>
        {viewingType === 'premium' ? (
          !isLoggedIn ? (
            <PaywallCard
              mode="login"
              onSignIn={() => navigation.navigate('Login')}
              onSubscribe={() => navigation.navigate('Premium')}
            />
          ) : !isSubscribed ? (
            <PaywallCard
              mode="premium"
              token={session?.accessToken}
              onSignIn={() => {}}
              onSubscribe={() => navigation.navigate('Premium')}
            />
          ) : (
            // ✅ Premium + subscribed → show article
            <Text style={styles.body}>
              {(data?.description ?? '').replace(/<[^>]+>/g, '')}
            </Text>
          )
        ) : viewingType === 'register' && !isLoggedIn ? (
          // Register article → not logged in → show Sign In + Subscribe
          <ScrollView>
            <PaywallCard
              mode="register"
              onSignIn={() => navigation.navigate('Login')}
              onSubscribe={function (): void {
                throw new Error('Function not implemented.');
              }}
            />
          </ScrollView>
        ) : (
          // Free or logged-in Register article → show full article
          <View style={{ marginHorizontal: 15 }}>
            <RenderHTML
              contentWidth={Dimensions.get('window').width - 32}
              source={{
                html: data?.description ?? '<p>No content available.</p>',
              }}
              baseStyle={{
                fontSize: 15,
                lineHeight: 24,
                color: colors.text,
              }}
              tagsStyles={{
                p: { marginBottom: 3 },
                strong: { fontWeight: 'bold' },
                b: { fontWeight: 'bold' },
                i: { fontStyle: 'italic' },
                h1: { fontSize: 22, fontWeight: '700', marginBottom: 3 },
                h2: { fontSize: 20, fontWeight: '600', marginBottom: 3 },
                h3: { fontSize: 18, fontWeight: '600', marginBottom: 3 },
              }}
            />
          </View>
        )}

        {/* Quote */}
        {/* <View style={styles.quoteWrap}>
          <View style={styles.quoteBar} />
          <Text style={styles.quoteText}>
            “Our goal is not to punish nations unfairly,” said one senior U.S.
            diplomat during a press briefing. “However, we must ensure that no
            country benefits economically from practices that violate
            international sanctions and threaten global security.”
          </Text>
        </View> */}
      </ScrollView>

      {/* Comments BottomSheet */}
      <BottomSheet visible={isVisible} onClose={() => setIsVisible(false)}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 12,
            color: colors.text,
          }}
        >
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
          renderItem={({ item }) => {
            const isOwner =
              item.authorId === currentUserId ||
              item.author?.id === currentUserId ||
              item.author?._id === currentUserId ||
              item.user?.id === currentUserId ||
              item.user?._id === currentUserId ||
              item.name?.trim().toLowerCase() === currentUserName;
            // handle all possible backend shapes

            const isEditing = editingCommentId === item._id;

            return (
              <View
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  borderColor: '#000',
                }}
              >
                {/* Header: user photo, name, and time */}
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

                {/* Content or Edit input */}
                {isEditing ? (
                  <View>
                    <TextInput
                      value={editContent}
                      onChangeText={setEditContent}
                      style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 6,
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        color: '#000',
                      }}
                      multiline
                    />
                    <View style={{ flexDirection: 'row', marginTop: 8 }}>
                      <TouchableOpacity
                        onPress={() => handleSaveEdit(item._id)}
                        style={{
                          backgroundColor: '#0A1F44',
                          paddingHorizontal: 14,
                          paddingVertical: 6,
                          borderRadius: 6,
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: '#fff' }}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingCommentId(null);
                          setEditContent('');
                        }}
                        style={{
                          backgroundColor: '#ccc',
                          paddingHorizontal: 14,
                          paddingVertical: 6,
                          borderRadius: 6,
                        }}
                      >
                        <Text style={{ color: '#000' }}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <>
                    {/* Comment text */}
                    <Text
                      style={{ fontSize: 14, lineHeight: 20, color: '#111' }}
                    >
                      {item.content}
                    </Text>

                    {/* Edit/Delete buttons BELOW comment */}
                    {isOwner && (
                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: 10,
                          marginBottom: -5,
                          justifyContent: 'flex-start',
                        }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setEditingCommentId(item._id);
                            setEditContent(item.content);
                          }}
                          style={{
                            paddingHorizontal: 2,
                          }}
                        >
                          <Text style={{ color: '#111' }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(item._id)}
                          style={{
                            paddingHorizontal: 8,
                          }}
                        >
                          <Text style={{ color: 'red' }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
            );
          }}
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

// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   ImageBackground,
//   ScrollView,
//   TouchableOpacity,
//   StatusBar,
//   Dimensions,
//   TextInput,
//   FlatList,
//   Pressable,
//   Alert,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { styles } from '../style/ArticleDetailStyles';
// import { apiPost, getApiWithOutQuery } from '../Utils/api/common';
// import { useMutation, useQuery } from '@tanstack/react-query';
// import {
//   API_ADD_COMMENT,
//   API_ARTICLES_DETAILS,
//   API_COMMENTS_LIST,
//   API_LIKES,
// } from '../Utils/api/APIConstant';
// import BottomSheet from '../Components/BottomSheet';
// import { useAuth } from './Auth/AuthContext';
// import PaywallCard from '../Components/PaywallCard';
// import { formatDateTime, getTimeAgo } from '../libs/helper';
// import ShowToast from '../Utils/ShowToast';
// import { navigate } from '../Navigators/utils';

// const HERO = require('../icons/news.png');
// const BACK = require('../icons/back.png');

// type Props = {
//   navigation: any;
//   route: { params: { id: string; slug: string } };
// };

// type Article = {
//   author: any;
//   _id: string;
//   slug: string;
//   title: string;
//   shortContent: string;
//   description: string;
//   image?: string;
//   createdAt?: string;
//   commentCount?: number;
//   likeCount?: number;
//   viewingType?: 'free' | 'register' | 'premium';
// };

// const ArticleDetailScreen: React.FC<Props> = ({ navigation, route }) => {
//   const { id, slug } = route.params;
//   const { session } = useAuth();
//   const insets = useSafeAreaInsets();

//   const [isVisible, setIsVisible] = useState(false);
//   const [commentText, setCommentText] = useState('');
//   const [isFav, setIsFav] = useState(false);
//   const [localLikeCount, setLocalLikeCount] = useState(0);
//   const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

//   const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

//   const handleSortChange = () => {
//     const newOrder = sortOrder === 'latest' ? 'oldest' : 'latest';
//     setSortOrder(newOrder);
//   };

//   const { data, isLoading, isError, refetch } = useQuery({
//     queryKey: ['article-details', slug],
//     queryFn: async (): Promise<Article> => {
//       const res = await getApiWithOutQuery({
//         url: `${API_ARTICLES_DETAILS}/${slug}`,
//       });
//       return res.data?.article;
//     },
//   });
//   const isLoggedIn = !!session?.accessToken; // or check from Redux/store
//   const isSubscribed =
//     session?.user?.plan === 'premium' || session?.user?.isPremium;

//   const likeCount = data?.likeCount ?? 0;

//   const { data: commentData, refetch: refetchComments } = useQuery({
//     queryKey: ['comments', id],
//     queryFn: async () => {
//       const res = await getApiWithOutQuery({
//         url: `${API_COMMENTS_LIST}/${id}?sortOrder=desc`,
//       });
//       return (res.data.comments ?? []) as Array<{
//         _id: string;
//         name: string;
//         content: string;
//         createdAt: string;
//         photo?: string;
//       }>;
//     },
//     staleTime: 0,
//   });

//   const { mutate: AddComment, isPending: commenting } = useMutation({
//     mutationFn: async (payload: any) => {
//       const res = await apiPost({ url: API_ADD_COMMENT, values: payload });
//       return res.data;
//     },
//     onSuccess: () => {
//       setCommentText('');
//       refetch();
//       refetchComments();
//       setIsVisible(false);
//     },
//     onError: err => console.log('Failed to add comment', err),
//   });

//   const sortedComments = React.useMemo(() => {
//     if (!commentData) return [];
//     return [...commentData].sort((a, b) => {
//       const timeA = new Date(a.createdAt).getTime();
//       const timeB = new Date(b.createdAt).getTime();
//       return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
//     });
//   }, [commentData, sortOrder]);

//   const handleAddComment = () => {
//     if (!session?.accessToken) {
//       ShowToast('Login Required', 'error');
//       navigate('Login');
//       return;
//     }
//     if (!commentText.trim()) return;
//     AddComment({ articleId: id, content: commentText });
//   };

//   React.useEffect(() => {
//     console.log('likeCount updated:', likeCount);
//     setLocalLikeCount(data?.likeCount as number);
//   }, [likeCount]);

//   const { mutate: toggleLike, isPending: likePending } = useMutation({
//     mutationFn: async (_like: boolean) => {
//       const res = await apiPost({
//         url: API_LIKES,
//         values: { articleId: id },
//       });
//       return res.data;
//     },
//     onError: (_err, likeJustSet) => {
//       setIsFav(!likeJustSet);
//       setLocalLikeCount(c => c + (likeJustSet ? -1 : +1));
//     },
//   });

//   const handleToggleFav = () => {
//     if (!session?.accessToken) {
//       ShowToast('Login Required', 'error');
//       navigate('Login');
//       return;
//     }
//     const next = !isFav;
//     setIsFav(next);
//     setLocalLikeCount(c => c + (next ? 1 : -1));
//     toggleLike(next);
//   };

//   const viewingType = data?.viewingType;
//   const token = session?.accessToken;
//   const needsLogin =
//     (viewingType === 'register' || viewingType === 'premium') && !token;

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" translucent />
//       <View style={{ height: insets.top }} />

//       {/* App Bar */}
//       <View style={styles.appBar}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack?.()}
//           hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
//           style={styles.backBtn}
//         >
//           <Image source={BACK} style={styles.backIcon} />
//         </TouchableOpacity>
//         <Text style={styles.appTitle} numberOfLines={1}>
//           Views
//         </Text>
//         <View style={{ width: scale(24) }} />
//       </View>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={{ paddingBottom: insets.bottom + scale(28) }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Hero */}
//         <ImageBackground
//           source={data?.image ? { uri: data.image } : HERO}
//           style={styles.hero}
//           imageStyle={styles.heroImg}
//         />

//         {/* Headline & meta */}
//         <View style={styles.headerBlock}>
//           <Text style={styles.headline}>
//             {data?.title ?? (isLoading ? 'Loading…' : '—')}
//           </Text>

//           <View
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//             }}
//           >
//             <Text style={styles.byAuthor}>
//               {data?.author ? `By ${data?.author}` : 'By Unknown'}
//             </Text>
//             {/* Likes + Comments */}
//             <View style={{ flexDirection: 'row' }}>
//               {/* ❤️ Likes */}
//               <TouchableOpacity
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   marginRight: 16,
//                 }}
//                 onPress={handleToggleFav}
//                 disabled={likePending}
//               >
//                 <Image
//                   source={
//                     isFav
//                       ? require('../icons/heart_red.png')
//                       : require('../icons/heart.png')
//                   }
//                   style={styles.chatIcon}
//                 />
//                 {localLikeCount > 0 && (
//                   <Text style={styles.likeCount}>{localLikeCount}</Text>
//                 )}
//               </TouchableOpacity>

//               {/* 💬 Comments */}
//               <TouchableOpacity
//                 style={{ flexDirection: 'row', alignItems: 'center' }}
//                 onPress={() => setIsVisible(true)}
//               >
//                 <Image
//                   source={require('../icons/comment1.png')}
//                   style={styles.chatIcon}
//                 />
//                 {data?.commentCount && data.commentCount > 0 && (
//                   <Text style={styles.likeCount}>{data.commentCount}</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>

//           <Text style={styles.dateline}>
//             {data?.createdAt ? formatDateTime(data.createdAt) : ''}
//           </Text>
//         </View>
//         {viewingType === 'premium' ? (
//           !isLoggedIn ? (
//             // Premium article → not logged in → show Sign In + Subscribe
//             <ScrollView>
//               <PaywallCard
//                 mode="login"
//                 onSignIn={() => navigation.navigate('Login')}
//                 onSubscribe={() => navigation.navigate('Premium')}
//               />
//             </ScrollView>
//           ) : !isSubscribed ? (
//             // Premium article → logged in but not subscribed → show Subscribe only
//             <ScrollView>
//               <PaywallCard
//                 mode="premium"
//                 token={session?.accessToken}
//                 onSignIn={() => {}}
//                 onSubscribe={() => navigation.navigate('Premium')}
//               />
//             </ScrollView>
//           ) : (
//             // Premium article → subscribed → show full article
//             <Text style={styles.body}>
//               {(data?.description ?? '').replace(/<[^>]+>/g, '')}
//             </Text>
//           )
//         ) : viewingType === 'register' && !isLoggedIn ? (
//           // Register article → not logged in → show Sign In + Subscribe
//           <ScrollView>
//             <PaywallCard mode="register" onSignIn={() => navigation.navigate('Login')} onSubscribe={function (): void {
//                 throw new Error('Function not implemented.');
//               } } />
//           </ScrollView>
//         ) : (
//           // Free or logged-in Register article → show full article
//           <Text style={styles.body}>
//             {(data?.description ?? '').replace(/<[^>]+>/g, '')}
//           </Text>
//         )}

//         {/* Quote */}
//         {/* <View style={styles.quoteWrap}>
//           <View style={styles.quoteBar} />
//           <Text style={styles.quoteText}>
//             “Our goal is not to punish nations unfairly,” said one senior U.S.
//             diplomat during a press briefing. “However, we must ensure that no
//             country benefits economically from practices that violate
//             international sanctions and threaten global security.”
//           </Text>
//         </View> */}
//       </ScrollView>

//       {/* Comments BottomSheet */}
//       <BottomSheet visible={isVisible} onClose={() => setIsVisible(false)}>
//         <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
//           Comments
//         </Text>

//         <TextInput
//           placeholder="Add a comment"
//           placeholderTextColor="#000"
//           value={commentText}
//           onChangeText={setCommentText}
//           style={{
//             height: scale(55),
//             borderWidth: 1,
//             borderColor: '#000',
//             borderRadius: 8,
//             paddingHorizontal: 5,
//             color: '#000',
//             marginBottom: 12,
//             backgroundColor: '#F0F6FF',
//           }}
//         />
//         <TouchableOpacity
//           style={{
//             backgroundColor: '#0A1F44',
//             height: scale(40),
//             borderRadius: 8,
//             justifyContent: 'center',
//             alignItems: 'center',
//             marginBottom: 12,
//           }}
//           onPress={handleAddComment}
//         >
//           <Text style={{ color: '#fff', fontWeight: '600' }}>
//             {commenting ? 'Posting...' : 'Comment'}
//           </Text>
//         </TouchableOpacity>

//         <View
//           style={{
//             borderWidth: 1,
//             borderColor: '#E1E1E1',
//             marginBottom: 16,
//           }}
//         />
//         <View style={styles.filterWrap}>
//           <Pressable style={styles.pillBtn} onPress={handleSortChange}>
//             <Text style={styles.pillText}>
//               {sortOrder === 'latest' ? 'Latest' : 'Oldest'}
//             </Text>
//             <Text style={styles.caret}>▾</Text>
//           </Pressable>
//         </View>
//         <FlatList
//           data={sortedComments}
//           keyExtractor={item => item._id}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: insets.bottom }}
//           renderItem={({ item }) => (
//             <View
//               style={{
//                 marginBottom: 16,
//                 padding: 12,
//                 borderWidth: 1,
//                 borderRadius: 10,
//                 borderColor: '#000',
//               }}
//             >
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   marginBottom: 4,
//                 }}
//               >
//                 <Image
//                   source={{ uri: item.photo }}
//                   style={{
//                     width: 36,
//                     height: 36,
//                     borderRadius: 18,
//                     marginRight: 8,
//                   }}
//                 />
//                 <View style={{ flex: 1 }}>
//                   <Text style={{ fontWeight: '600', fontSize: 14 }}>
//                     {item.name}
//                   </Text>
//                   <Text style={{ fontSize: 12, color: '#6B7280' }}>
//                     {getTimeAgo(item.createdAt)}
//                   </Text>
//                 </View>
//               </View>
//               <Text style={{ fontSize: 14, lineHeight: 20, color: '#111' }}>
//                 {item.content}
//               </Text>
//             </View>
//           )}
//           ListEmptyComponent={
//             <Text style={{ textAlign: 'center', color: '#6B7280' }}>
//               {isLoading ? 'Loading comments…' : 'No comments yet'}
//             </Text>
//           }
//         />
//       </BottomSheet>
//     </View>
//   );
// };

// export default ArticleDetailScreen;
