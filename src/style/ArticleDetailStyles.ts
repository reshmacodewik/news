import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 375;
export const scale = (n: number) => (width / BASE_W) * n;
const f = (n: number) => Math.round(PixelRatio.roundToNearestPixel(scale(n)));

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  /* App Bar */
  appBar: {
    height: scale(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    justifyContent: 'space-between',
    borderBottomColor: '#ECEFF3',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {  },
  backIcon: { width: scale(20), height: scale(20), tintColor: '#111827' },
  appTitle: { fontSize: f(16), fontWeight: '700', color: '#374151' },

  /* Horizontal tabs */
  tabsWrap: {
    borderBottomColor: '#ECEFF3',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#FFFFFF',
  },
  tabBtn: { paddingHorizontal: scale(16), alignItems: 'center' },
  tabText: {
    paddingTop: scale(10),
    paddingBottom: scale(8),
    fontSize: f(16),
    color: '#6B7280',
    fontWeight: '600',
  },
  tabTextActive: { color: '#2563EB' },
  tabBar: {
    width: '100%',
    height: scale(3),
    borderTopLeftRadius: scale(2),
    borderTopRightRadius: scale(2),
    marginBottom: -StyleSheet.hairlineWidth,
  },
  tabBarActive: { backgroundColor: '#2563EB' },
  tabBarGhost: { backgroundColor: 'transparent' },

  /* Scroll content */
  scroll: { flex: 1 },

  /* Hero */
  hero: {
    height: Math.min(height * 0.25, scale(220)),
    width: '100%',
    backgroundColor: '#F3F4F6',
  },
  heroImg: { resizeMode: 'cover' },

  /* Header block */
  headerBlock: {
    paddingHorizontal: scale(16),
    paddingTop: scale(16),
    paddingBottom: scale(8),
  },
  headline: {
    fontSize: 24,
    lineHeight: f(32),
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
    marginBottom: scale(10),
  },
  byline: { fontSize: 14, color: '#727272' },
  byAuthor: { color: '#727272', fontSize: f(13) },
  dateline: { marginTop: scale(2), fontSize: f(13), color: '#727272' },

  heartIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },

  chatIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },

  likeCount: {
    fontSize: 14,
    color: '#333',
  },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '55%',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  heading: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  commentBtn: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  commentBox: { flexDirection: 'row', marginBottom: 0,borderWidth:1 ,borderColor:'#ECEFF3',borderRadius:10,paddingHorizontal:10},
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  username: { fontWeight: '600', fontSize: 14 },
  time: { color: '#888', fontSize: 12 },
  text: { marginTop: 4, fontSize: 14, color: '#333' },
  actions: { flexDirection: 'row', marginTop: 6, gap: 10 },
  actionBtn: { color: '#555', fontSize: 13 },
  replyBtn: { color: '#007bff', fontSize: 13 },
  /* Body text */
  body: {
    paddingHorizontal: scale(16),
    fontSize: 16,
    lineHeight: f(24),
    color: '#111827',
    marginTop: scale(12),
  },

  /* Action strip */
  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: scale(12),
    marginTop: scale(14),
    borderTopColor: '#ECEFF3',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECEFF3',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#FFFFFF',
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: scale(6) },
  statIcon: { width: scale(20), height: scale(20), tintColor: '#111827' },
  statText: { fontSize: f(14), color: '#374151' },

  smallIndicator: {
    alignSelf: 'center',
    width: scale(120),
    height: scale(4),
    borderRadius: 999,
    backgroundColor: '#ECEFF3',
    marginTop: scale(10),
  },

  /* Quote block */
  quoteWrap: {
    marginHorizontal: scale(16),
    marginTop: scale(16),
    backgroundColor: '#EEF5FF',
    borderRadius: scale(12),
    padding: scale(14),
    flexDirection: 'row',
  },
  quoteBar: {
    width: scale(4),
    borderRadius: scale(4),
    backgroundColor: '#2260B2',
    marginRight: scale(10),
  },
  quoteText: {
    flex: 1,
    color: '#0F172A',
    fontSize: f(15),
    lineHeight: f(22),
  },
});
