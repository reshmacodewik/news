// import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
//   ActivityIndicator,
//   AppState,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useFocusEffect } from '@react-navigation/native';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import RenderHTML from 'react-native-render-html';

// import { styles } from '../style/ArticleDetailStyles';
// import { apiPost, getApiWithOutQuery } from '../Utils/api/common';
// import {
//   API_ADD_COMMENT,
//   API_ARTICLES_DETAILS,
//   API_COMMENTS_LIST,
//   API_DELETE_COMMENT,
//   API_LIKES,
//   API_UPDATE_COMMENT,
//   API_GET_USER_ACTIVE_PLAN, // 👈 added
// } from '../Utils/api/APIConstant';

// import BottomSheet from '../Components/BottomSheet';
// import PaywallCard from '../Components/PaywallCard';
// import { useAuth } from './Auth/AuthContext';
// import { navigate } from '../Navigators/utils';
// import { formatDateTime, getTimeAgo } from '../libs/helper';
// import ShowToast from '../Utils/ShowToast';
// import { useTheme } from '../context/ThemeContext';

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
//   isLiked?: boolean;
// };

// const ArticleDetailScreen: React.FC<Props> = ({ navigation, route }) => {
//   const { id, slug } = route.params;
//   const insets = useSafeAreaInsets();
//   const { session } = useAuth();
//   const { theme, colors } = useTheme();
//   const queryClient = useQueryClient();

//   const [isVisible, setIsVisible] = useState(false);
//   const [commentText, setCommentText] = useState('');
//   const [isFav, setIsFav] = useState(false);
//   const [localLikeCount, setLocalLikeCount] = useState(0);
//   const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
//   const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
//   const [editContent, setEditContent] = useState('');

//   const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

//   const currentUserId = session?.user?.id || session?.user?._id;
//   const currentUserName = session?.user?.name?.trim().toLowerCase() || '';

//   const isLoggedIn = !!session?.accessToken;
//   const userId = session?.user?.id || session?.user?._id || null;

//   /* ---------------------------- Article details ---------------------------- */
//   const {
//     data: data,
//     isLoading: isLoadingArticle,
//     refetch: refetchArticle,
//   } = useQuery({
//     queryKey: ['article-details', slug],
//     queryFn: async (): Promise<Article> => {
//       const res = await getApiWithOutQuery({
//         url: `${API_ARTICLES_DETAILS}/${slug}`,
//       });
//       return {
//         ...res.data.article,
//         likeCount: res.data.likeCount,
//         commentCount: res.data.commentCount,
//         isLiked: res.data.isLiked,
//       };
//     },
//   });

//   const article = data;
//   const likeCount = article?.likeCount ?? 0;
//   const fetchedCommentCount = article?.commentCount ?? 0;

//   /* ------------------------- Active subscription (API) --------------------- */
//   const {
//     data: activePlanData,
//     isLoading: subLoading,
//     refetch: refetchSub,
//   } = useQuery({
//     queryKey: ['active-plan', userId],
//     enabled: Boolean(isLoggedIn && userId),
//     refetchOnMount: 'always',
//     queryFn: async () => {
//       const res = await fetch(
//         `http://192.168.1.36:9991${API_GET_USER_ACTIVE_PLAN}`,
//         { headers: { Authorization: `Bearer ${session?.accessToken}` } }
//       );
//       const json = await res.json();
//       return json?.data ?? null;
//     },
//   });

//   const isSubscribed =
//     activePlanData?.active === true &&
//     String(activePlanData?.subscription?.status || '').toLowerCase() === 'active' &&
//     String(activePlanData?.subscription?.paymentStatus || '').toLowerCase() === 'completed';

//   // Refetch both article + subscription when screen focuses
//   useFocusEffect(
//     useCallback(() => {
//       refetchArticle();
//       refetchSub();
//     }, [refetchArticle, refetchSub])
//   );

//   // Refetch subscription when app comes to foreground (after checkout)
//   useEffect(() => {
//     const sub = AppState.addEventListener('change', (next) => {
//       if (next === 'active') {
//         refetchSub();
//       }
//     });
//     return () => sub.remove();
//   }, [refetchSub]);

//   /* ----------------------------- Comments list ---------------------------- */
//   const {
//     data: commentData,
//     refetch: refetchComments,
//   } = useQuery({
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
//         authorId: string;
//         author?: { id?: string; _id?: string };
//         user?: { id?: string; _id?: string };
//       }>;
//     },
//     staleTime: 0,
//   });

//   const sortedComments = useMemo(() => {
//     if (!commentData) return [];
//     return [...commentData].sort((a, b) => {
//       const timeA = new Date(a.createdAt).getTime();
//       const timeB = new Date(b.createdAt).getTime();
//       return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
//     });
//   }, [commentData, sortOrder]);

//   /* ------------------------------- Mutations ------------------------------ */
//   const { mutate: AddComment, isPending: commenting } = useMutation({
//     mutationFn: async (payload: any) => {
//       const res = await apiPost({ url: API_ADD_COMMENT, values: payload });
//       return res.data;
//     },
//     onSuccess: () => {
//       setCommentText('');
//       setIsVisible(false);
//       refetchComments();
//       queryClient.invalidateQueries({ queryKey: ['article-details', slug] });
//     },
//   });

//   const { mutate: toggleLike, isPending: likePending } = useMutation({
//     mutationFn: async () => {
//       const res = await apiPost({
//         url: API_LIKES,
//         values: { articleId: id },
//       });
//       return res.data;
//     },
//     onMutate: async () => {
//       await queryClient.cancelQueries({ queryKey: ['article-details', slug] });
//       const prev = queryClient.getQueryData(['article-details', slug]);
//       const previousFav = isFav;

//       setIsFav(!previousFav);
//       setLocalLikeCount((c) => c + (previousFav ? -1 : 1));

//       return { prev, previousFav };
//     },
//     onError: (_err, _vars, ctx) => {
//       if (ctx?.prev) queryClient.setQueryData(['article-details', slug], ctx.prev);
//       setIsFav(ctx?.previousFav ?? false);
//       setLocalLikeCount((c) => c + (ctx?.previousFav ? 1 : -1));
//       ShowToast('Failed to update like', 'error');
//     },
//     onSuccess: (res) => {
//       queryClient.setQueryData(['article-details', slug], (old: any) => {
//         if (!old) return old;
//         return {
//           ...old,
//           likeCount: res.data?.likeCount ?? old.likeCount,
//           isLiked: res.data?.isLiked ?? old.isLiked,
//         };
//       });
//       queryClient.invalidateQueries({ queryKey: ['articles'] });

//       ShowToast(
//         res.data?.isLiked
//           ? 'Removed from favorites successfully.'
//           : 'Added to favorites successfully.',
//         'success'
//       );
//     },
//   });

//   useEffect(() => {
//     if (article) {
//       setIsFav(article.isLiked ?? false);
//       setLocalLikeCount(article.likeCount ?? 0);
//     }
//   }, [article]);

//   /* -------------------------------- Handlers ------------------------------ */
//   const handleSortChange = () => {
//     setSortOrder((s) => (s === 'latest' ? 'oldest' : 'latest'));
//   };

//   const handleAddComment = () => {
//     if (!session?.accessToken) {
//       ShowToast('Login Required', 'error');
//       navigate('Login');
//       return;
//     }
//     if (!commentText.trim()) return;
//     AddComment({ articleId: id, content: commentText });
//   };

//   const handleToggleFav = async () => {
//     if (!session?.accessToken) {
//       ShowToast('Login Required', 'error');
//       navigate('Login');
//       return;
//     }
//     if (!article?._id) return;

//     const newLiked = !isFav;
//     const newCount = localLikeCount + (newLiked ? 1 : -1);
//     setIsFav(newLiked);
//     setLocalLikeCount(newCount);

//     try {
//       const res = await apiPost({
//         url: API_LIKES,
//         values: { articleId: article._id },
//       });

//       const serverData = res.data?.data;
//       if (serverData) {
//         setIsFav(serverData.isLiked);
//         setLocalLikeCount(serverData.likeCount);
//       }
//       refetchArticle();
//     } catch (err) {
//       setIsFav(!newLiked);
//       setLocalLikeCount(localLikeCount);
//       ShowToast('Failed to update like', 'error');
//     }
//   };

//   const handleDeleteComment = async (commentId: string) => {
//     try {
//       const res = await apiPost({
//         url: API_DELETE_COMMENT.replace(':id', commentId),
//         values: {},
//       });

//       if (res?.success || res?.status) {
//         ShowToast('Comment deleted successfully', 'success');

//         queryClient.setQueryData(['article-details', slug], (old: any) => {
//           if (!old) return old;
//           return {
//             ...old,
//             commentCount: Math.max((old.commentCount ?? 1) - 1, 0),
//           };
//         });

//         await refetchComments();
//       } else {
//         ShowToast('Failed to delete comment', 'error');
//       }
//     } catch {
//       ShowToast('Something went wrong', 'error');
//     }
//   };

//   const handleSaveEdit = async (commentId: string) => {
//     if (!editContent.trim()) {
//       ShowToast('Comment cannot be empty', 'error');
//       return;
//     }

//     try {
//       const res = await apiPost({
//         url: API_UPDATE_COMMENT.replace(':id', commentId),
//         values: { content: editContent },
//       });

//       if (res?.success || res?.status) {
//         ShowToast('Comment updated successfully', 'success');
//         setEditingCommentId(null);
//         setEditContent('');
//         await refetchComments();
//       } else {
//         ShowToast('Failed to update comment', 'error');
//       }
//     } catch {
//       ShowToast('Something went wrong', 'error');
//     }
//   };

//   /* ------------------------------ Paywall flags --------------------------- */
//   const viewingType = article?.viewingType;
//   const showLoginPaywall =
//     (viewingType === 'register' || viewingType === 'premium') && !isLoggedIn;

//   const showSubscribePaywall =
//     viewingType === 'premium' && isLoggedIn && !subLoading && !isSubscribed;

//   const showLoadingGate =
//     viewingType === 'premium' && isLoggedIn && subLoading; // avoid flashing paywall

//   /* --------------------------------- UI ----------------------------------- */
//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <StatusBar barStyle="dark-content" translucent />
//       <View style={{ height: insets.top }} />

//       {/* App Bar */}
//       <View style={[styles.appBar, { backgroundColor: colors.background }]}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack?.()}
//           hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
//           style={[styles.backBtn]}
//         >
//           <Image source={BACK} style={[styles.backIcon, { tintColor: colors.text }]} />
//         </TouchableOpacity>
//         <Text style={[styles.appTitle, { color: colors.text }]} numberOfLines={1}>
//           Arcalis News
//         </Text>
//         <View style={{ width: scale(24) }} />
//       </View>

//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={{ paddingBottom: insets.bottom + scale(28) }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Hero */}
//         {isLoadingArticle ? (
//           <View
//             style={[
//               styles.hero,
//               { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2' },
//             ]}
//           >
//             <ActivityIndicator size="large" color="#0A1F44" />
//           </View>
//         ) : (
//           <ImageBackground
//             source={article?.image ? { uri: article.image } : HERO}
//             style={styles.hero}
//             imageStyle={styles.heroImg}
//           />
//         )}

//         {/* Headline & meta */}
//         <View style={styles.headerBlock}>
//           <Text
//             style={[
//               styles.headline,
//               { color: theme === 'dark' ? colors.headingtext : '#000' },
//             ]}
//           >
//             {article?.title ?? (isLoadingArticle ? 'Loading…' : '—')}
//           </Text>

//           <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
//             <Text style={styles.byAuthor}>
//               {article?.author ? `By ${article?.author}` : 'By Unknown'}
//             </Text>

//             {/* Likes + Comments */}
//             <View style={{ flexDirection: 'row' }}>
//               {/* ❤️ Likes */}
//               <TouchableOpacity
//                 style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
//                 onPress={handleToggleFav}
//                 disabled={likePending}
//               >
//                 <Image
//                   source={isFav ? require('../icons/heart_red.png') : require('../icons/heart.png')}
//                   style={[styles.chatIcon, { tintColor: colors.text }]}
//                 />
//                 {likeCount > 0 && (
//                   <Text style={[styles.likeCount, { color: colors.text }]}>{likeCount}</Text>
//                 )}
//               </TouchableOpacity>

//               {/* 💬 Comments */}
//               <TouchableOpacity
//                 style={{ flexDirection: 'row', alignItems: 'center' }}
//                 onPress={() => setIsVisible(true)}
//               >
//                 <Image
//                   source={require('../icons/comment1.png')}
//                   style={[styles.chatIcon, { tintColor: colors.text }]}
//                 />
//                 {fetchedCommentCount > 0 && (
//                   <Text style={[styles.likeCount, { color: colors.text }]}>
//                     {fetchedCommentCount}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>

//           <Text style={styles.dateline}>
//             {article?.createdAt ? formatDateTime(article.createdAt) : ''}
//           </Text>
//         </View>

//         {/* ------------------------- PAYWALL / CONTENT ------------------------ */}
//         {viewingType === 'premium' ? (
//           showLoginPaywall ? (
//             <PaywallCard
//               mode="login"
//               onSignIn={() => navigation.navigate('Login')}
//               onSubscribe={() => navigation.navigate('Premium')}
//             />
//           ) : showLoadingGate ? (
//             <View style={{ padding: 24, alignItems: 'center' }}>
//               <ActivityIndicator size="large" color="#2260B2" />
//             </View>
//           ) : showSubscribePaywall ? (
//             <PaywallCard
//               mode="premium"
//               token={session?.accessToken}
//               onSignIn={() => {}}
//               onSubscribe={() => navigation.navigate('Premium')}
//             />
//           ) : (
//             // ✅ Premium + subscribed → full article
//             <View style={{ marginHorizontal: 15 }}>
//               <RenderHTML
//                 contentWidth={Dimensions.get('window').width - 32}
//                 source={{ html: article?.description ?? '<p>No content available.</p>' }}
//                 baseStyle={{ fontSize: 15, lineHeight: 24, color: colors.text }}
//                 tagsStyles={{
//                   p: { marginBottom: 3 },
//                   strong: { fontWeight: 'bold' },
//                   b: { fontWeight: 'bold' },
//                   i: { fontStyle: 'italic' },
//                   h1: { fontSize: 22, fontWeight: '700', marginBottom: 3 },
//                   h2: { fontSize: 20, fontWeight: '600', marginBottom: 3 },
//                   h3: { fontSize: 18, fontWeight: '600', marginBottom: 3 },
//                 }}
//               />
//             </View>
//           )
//         ) : viewingType === 'register' && !isLoggedIn ? (
//           // Register article → not logged in → paywall
//           <ScrollView>
//             <PaywallCard
//               mode="register"
//               onSignIn={() => navigation.navigate('Login')}
//               onSubscribe={() => navigation.navigate('Premium')}
//             />
//           </ScrollView>
//         ) : (
//           // Free or logged-in Register article → show full article
//           <View style={{ marginHorizontal: 15 }}>
//             <RenderHTML
//               contentWidth={Dimensions.get('window').width - 32}
//               source={{ html: article?.description ?? '<p>No content available.</p>' }}
//               baseStyle={{ fontSize: 15, lineHeight: 24, color: colors.text }}
//               tagsStyles={{
//                 p: { marginBottom: 3 },
//                 strong: { fontWeight: 'bold' },
//                 b: { fontWeight: 'bold' },
//                 i: { fontStyle: 'italic' },
//                 h1: { fontSize: 22, fontWeight: '700', marginBottom: 3 },
//                 h2: { fontSize: 20, fontWeight: '600', marginBottom: 3 },
//                 h3: { fontSize: 18, fontWeight: '600', marginBottom: 3 },
//               }}
//             />
//           </View>
//         )}
//       </ScrollView>

//       {/* --------------------------- Comments BottomSheet --------------------- */}
//       <BottomSheet visible={isVisible} onClose={() => setIsVisible(false)}>
//         <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: colors.text }}>
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

//         <View style={{ borderWidth: 1, borderColor: '#E1E1E1', marginBottom: 16 }} />

//         <View style={styles.filterWrap}>
//           <Pressable style={styles.pillBtn} onPress={() => setSortOrder((s) => (s === 'latest' ? 'oldest' : 'latest'))}>
//             <Text style={styles.pillText}>{sortOrder === 'latest' ? 'Latest' : 'Oldest'}</Text>
//             <Text style={styles.caret}>▾</Text>
//           </Pressable>
//         </View>

//         <FlatList
//           data={sortedComments}
//           keyExtractor={(item) => item._id}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: insets.bottom }}
//           renderItem={({ item }) => {
//             const isOwner =
//               item.authorId === currentUserId ||
//               item.author?.id === currentUserId ||
//               item.author?._id === currentUserId ||
//               item.user?.id === currentUserId ||
//               item.user?._id === currentUserId ||
//               (item.name || '').trim().toLowerCase() === currentUserName;

//             const isEditing = editingCommentId === item._id;

//             return (
//               <View
//                 style={{
//                   marginBottom: 16,
//                   padding: 12,
//                   borderWidth: 1,
//                   borderRadius: 10,
//                   borderColor: '#000',
//                 }}
//               >
//                 {/* Header */}
//                 <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
//                   {!!item.photo && (
//                     <Image
//                       source={{ uri: item.photo }}
//                       style={{ width: 36, height: 36, borderRadius: 18, marginRight: 8 }}
//                     />
//                   )}
//                   <View style={{ flex: 1 }}>
//                     <Text style={{ fontWeight: '600', fontSize: 14 }}>{item.name}</Text>
//                     <Text style={{ fontSize: 12, color: '#6B7280' }}>{getTimeAgo(item.createdAt)}</Text>
//                   </View>
//                 </View>

//                 {/* Content or Edit input */}
//                 {isEditing ? (
//                   <View>
//                     <TextInput
//                       value={editContent}
//                       onChangeText={setEditContent}
//                       style={{
//                         borderWidth: 1,
//                         borderColor: '#ccc',
//                         borderRadius: 6,
//                         paddingHorizontal: 8,
//                         paddingVertical: 6,
//                         color: '#000',
//                       }}
//                       multiline
//                     />
//                     <View style={{ flexDirection: 'row', marginTop: 8 }}>
//                       <TouchableOpacity
//                         onPress={() => handleSaveEdit(item._id)}
//                         style={{
//                           backgroundColor: '#0A1F44',
//                           paddingHorizontal: 14,
//                           paddingVertical: 6,
//                           borderRadius: 6,
//                           marginRight: 8,
//                         }}
//                       >
//                         <Text style={{ color: '#fff' }}>Save</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         onPress={() => {
//                           setEditingCommentId(null);
//                           setEditContent('');
//                         }}
//                         style={{
//                           backgroundColor: '#ccc',
//                           paddingHorizontal: 14,
//                           paddingVertical: 6,
//                           borderRadius: 6,
//                         }}
//                       >
//                         <Text style={{ color: '#000' }}>Cancel</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 ) : (
//                   <>
//                     <Text style={{ fontSize: 14, lineHeight: 20, color: '#111' }}>{item.content}</Text>

//                     {isOwner && (
//                       <View style={{ flexDirection: 'row', marginTop: 10, marginBottom: -5, justifyContent: 'flex-start' }}>
//                         <TouchableOpacity
//                           onPress={() => {
//                             setEditingCommentId(item._id);
//                             setEditContent(item.content);
//                           }}
//                           style={{ paddingHorizontal: 2 }}
//                         >
//                           <Text style={{ color: '#111' }}>Edit</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           onPress={() => handleDeleteComment(item._id)}
//                           style={{ paddingHorizontal: 8 }}
//                         >
//                           <Text style={{ color: 'red' }}>Delete</Text>
//                         </TouchableOpacity>
//                       </View>
//                     )}
//                   </>
//                 )}
//               </View>
//             );
//           }}
//           ListEmptyComponent={
//             <Text style={{ textAlign: 'center', color: '#6B7280' }}>
//               {isLoadingArticle ? 'Loading comments…' : 'No comments yet'}
//             </Text>
//           }
//         />
//       </BottomSheet>
//     </View>
//   );
// };

// export default ArticleDetailScreen;
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  ActivityIndicator,
  AppState,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import RenderHTML from 'react-native-render-html';
import { styles } from '../style/ArticleDetailStyles';
import { apiPost, getApiWithOutQuery } from '../Utils/api/common';
import {
  API_ADD_COMMENT,
  API_ARTICLES_DETAILS,
  API_COMMENTS_LIST,
  API_DELETE_COMMENT,
  API_LIKES,
  API_UPDATE_COMMENT,
  API_GET_USER_ACTIVE_PLAN, // 👈 added
} from '../Utils/api/APIConstant';
import BottomSheet from '../Components/BottomSheet';
import PaywallCard from '../Components/PaywallCard';
import { useAuth } from './Auth/AuthContext';
import { navigate } from '../Navigators/utils';
import { formatDateTime, getTimeAgo } from '../libs/helper';
import ShowToast from '../Utils/ShowToast';
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
  isLiked?: boolean;
};

const ArticleDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { id, slug } = route.params;
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { theme, colors } = useTheme();
  const queryClient = useQueryClient();

  const [isVisible, setIsVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isFav, setIsFav] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const scale = (size: number) => (Dimensions.get('window').width / 375) * size;

  const currentUserId = session?.user?.id || session?.user?._id;
  const currentUserName = session?.user?.name?.trim().toLowerCase() || '';

  const isLoggedIn = !!session?.accessToken;
  const userId = session?.user?.id || session?.user?._id || null;

  /* ---------------------------- Article details ---------------------------- */
  const {
    data: data,
    isLoading: isLoadingArticle,
    refetch: refetchArticle,
  } = useQuery({
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

  const article = data;
  const likeCount = article?.likeCount ?? 0;
  const fetchedCommentCount = article?.commentCount ?? 0;

  /* ------------------------- Active subscription (API) --------------------- */
  const {
    data: activePlanData,
    isLoading: subLoading,
    refetch: refetchSub,
  } = useQuery({
    queryKey: ['active-plan', userId],
    enabled: Boolean(isLoggedIn && userId),
    refetchOnMount: 'always',
    queryFn: async () => {
      const res = await fetch(
        `http://192.168.1.36:9991${API_GET_USER_ACTIVE_PLAN}`,
        { headers: { Authorization: `Bearer ${session?.accessToken}` } },
      );
      const json = await res.json();
      return json?.data ?? null;
    },
  });

  const isSubscribed =
    activePlanData?.active === true &&
    String(activePlanData?.subscription?.status || '').toLowerCase() ===
      'active' &&
    String(activePlanData?.subscription?.paymentStatus || '').toLowerCase() ===
      'completed';

  // Refetch both article + subscription when screen focuses
  useFocusEffect(
    useCallback(() => {
      refetchArticle();
      refetchSub();
    }, [refetchArticle, refetchSub]),
  );

  // Refetch subscription when app comes to foreground (after checkout)
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') {
        refetchSub();
      }
    });
    return () => sub.remove();
  }, [refetchSub]);

  /* ----------------------------- Comments list ---------------------------- */
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
        author?: { id?: string; _id?: string };
        user?: { id?: string; _id?: string };
      }>;
    },
    staleTime: 0,
  });

  const sortedComments = useMemo(() => {
    if (!commentData) return [];
    return [...commentData].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'latest' ? timeB - timeA : timeA - timeB;
    });
  }, [commentData, sortOrder]);

  /* ------------------------------- Mutations ------------------------------ */
  const { mutate: AddComment, isPending: commenting } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiPost({ url: API_ADD_COMMENT, values: payload });
      return res.data;
    },
    onSuccess: () => {
      setCommentText('');
      setIsVisible(false);
      refetchComments();
      queryClient.invalidateQueries({ queryKey: ['article-details', slug] });
    },
  });

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
      const previousFav = isFav;

      setIsFav(!previousFav);
      setLocalLikeCount(c => c + (previousFav ? -1 : 1));

      return { prev, previousFav };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(['article-details', slug], ctx.prev);
      setIsFav(ctx?.previousFav ?? false);
      setLocalLikeCount(c => c + (ctx?.previousFav ? 1 : -1));
      ShowToast('Failed to update like', 'error');
    },
    onSuccess: res => {
      queryClient.setQueryData(['article-details', slug], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          likeCount: res.data?.likeCount ?? old.likeCount,
          isLiked: res.data?.isLiked ?? old.isLiked,
        };
      });
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
    if (article) {
      setIsFav(article.isLiked ?? false);
      setLocalLikeCount(article.likeCount ?? 0);
    }
  }, [article]);

  /* -------------------------------- Handlers ------------------------------ */
  const handleSortChange = () => {
    setSortOrder(s => (s === 'latest' ? 'oldest' : 'latest'));
  };

  const handleAddComment = () => {
    if (!session?.accessToken) {
      ShowToast('Login Required', 'error');
      navigate('Login');
      return;
    }
    if (!commentText.trim()) return;
    AddComment({ articleId: id, content: commentText });
  };

  const handleToggleFav = async () => {
    if (!session?.accessToken) {
      ShowToast('Login Required', 'error');
      navigate('Login');
      return;
    }
    if (!article?._id) return;

    const newLiked = !isFav;
    const newCount = localLikeCount + (newLiked ? 1 : -1);
    setIsFav(newLiked);
    setLocalLikeCount(newCount);

    try {
      const res = await apiPost({
        url: API_LIKES,
        values: { articleId: article._id },
      });

      const serverData = res.data?.data;
      if (serverData) {
        setIsFav(serverData.isLiked);
        setLocalLikeCount(serverData.likeCount);
      }
      refetchArticle();
    } catch (err) {
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

        queryClient.setQueryData(['article-details', slug], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            commentCount: Math.max((old.commentCount ?? 1) - 1, 0),
          };
        });

        await refetchComments();
      } else {
        ShowToast('Failed to delete comment', 'error');
      }
    } catch {
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
        await refetchComments();
      } else {
        ShowToast('Failed to update comment', 'error');
      }
    } catch {
      ShowToast('Something went wrong', 'error');
    }
  };

  /* ------------------------------ Paywall flags --------------------------- */
  const viewingType = article?.viewingType;
  const showLoginPaywall =
    (viewingType === 'register' || viewingType === 'premium') && !isLoggedIn;

  const showSubscribePaywall =
    viewingType === 'premium' && isLoggedIn && !subLoading && !isSubscribed;

  const showLoadingGate = viewingType === 'premium' && isLoggedIn && subLoading; // avoid flashing paywall

  /* --------------------------------- UI ----------------------------------- */
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
        {isLoadingArticle ? (
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
            source={article?.image ? { uri: article.image } : HERO}
            style={styles.hero}
            imageStyle={styles.heroImg}
          />
        )}

        {/* Headline & meta */}
        <View style={styles.headerBlock}>
          <Text
            style={[
              styles.headline,
              { color: theme === 'dark' ? colors.headingtext : '#000' },
            ]}
          >
            {article?.title ?? (isLoadingArticle ? 'Loading…' : '—')}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.byAuthor}>
              {article?.author ? `By ${article?.author}` : 'By Unknown'}
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
            {article?.createdAt ? formatDateTime(article.createdAt) : ''}
          </Text>
        </View>

        {/* ------------------------- PAYWALL / CONTENT ------------------------ */}
        {viewingType === 'premium' ? (
          showLoginPaywall ? (
            <PaywallCard
              mode="login"
              onSignIn={() => navigation.navigate('Login')}
              onSubscribe={() => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('https://arcalisnews.com/subscription');
                } else {
                  navigation.navigate('Premium');
                }
              }}
            />
          ) : showLoadingGate ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#2260B2" />
            </View>
          ) : showSubscribePaywall ? (
            <PaywallCard
              mode="premium"
              token={session?.accessToken}
              onSignIn={() => {}}
              onSubscribe={() => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('https://arcalisnews.com/subscription');
                } else {
                  navigation.navigate('Premium');
                }
              }}
            />
          ) : (
            // ✅ Premium + subscribed → full article
            <View style={{ marginHorizontal: 15 }}>
              <RenderHTML
                contentWidth={Dimensions.get('window').width - 32}
                source={{
                  html: article?.description ?? '<p>No content available.</p>',
                }}
                baseStyle={{ fontSize: 15, lineHeight: 24, color: colors.text }}
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
          )
        ) : viewingType === 'register' && !isLoggedIn ? (
          // Register article → not logged in → paywall
          <ScrollView>
            <PaywallCard
              mode="register"
              onSignIn={() => navigation.navigate('Login')}
              onSubscribe={() => navigation.navigate('Premium')}
            />
          </ScrollView>
        ) : (
          // Free or logged-in Register article → show full article
          <View style={{ marginHorizontal: 15 }}>
            <RenderHTML
              contentWidth={Dimensions.get('window').width - 32}
              source={{
                html: article?.description ?? '<p>No content available.</p>',
              }}
              baseStyle={{ fontSize: 15, lineHeight: 24, color: colors.text }}
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
      </ScrollView>

      {/* --------------------------- Comments BottomSheet --------------------- */}
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
          style={{ borderWidth: 1, borderColor: '#E1E1E1', marginBottom: 16 }}
        />

        <View style={styles.filterWrap}>
          <Pressable
            style={styles.pillBtn}
            onPress={() =>
              setSortOrder(s => (s === 'latest' ? 'oldest' : 'latest'))
            }
          >
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
              (item.name || '').trim().toLowerCase() === currentUserName;

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
                {/* Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}
                >
                  {!!item.photo && (
                    <Image
                      source={{ uri: item.photo }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        marginRight: 8,
                      }}
                    />
                  )}
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
                    <Text
                      style={{ fontSize: 14, lineHeight: 20, color: '#111' }}
                    >
                      {item.content}
                    </Text>

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
                          style={{ paddingHorizontal: 2 }}
                        >
                          <Text style={{ color: '#111' }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteComment(item._id)}
                          style={{ paddingHorizontal: 8 }}
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
              {isLoadingArticle ? 'Loading comments…' : 'No comments yet'}
            </Text>
          }
        />
      </BottomSheet>
    </View>
  );
};

export default ArticleDetailScreen;
