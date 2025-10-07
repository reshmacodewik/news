import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 375;
export const scale = (n: number) => (width / BASE_W) * n;
const f = (n: number) => Math.round(PixelRatio.roundToNearestPixel(scale(n)));

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e3e9ee' },

  // Top bar
  topBar: {
    height: scale(56),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
    logo: { width: scale(155), height: scale(28) },
  avatarWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: '#F1F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },

  // Tabs
  tabsWrap: {
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBtn: { paddingHorizontal: scale(18), alignItems: 'center' },
  tabText: {
    paddingTop: scale(10),
    paddingBottom: scale(8),
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabTextActive: { color: '#2260B2' },
  tabBar: {
    width: '100%',
    height: scale(3),
    borderTopLeftRadius: scale(2),
    borderTopRightRadius: scale(2),
    marginBottom: -StyleSheet.hairlineWidth,
  },
  tabBarActive: {
    width: scale(70),
    height: scale(3),
    borderRadius: scale(2),
    backgroundColor: '#2260B2',
    marginBottom: scale(8),
  },

  tabBarGhost: { backgroundColor: 'transparent' },

  // Content


  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#0F172A',
    marginTop: scale(14),
    marginBottom: scale(10),
    paddingHorizontal: scale(16),
  },

  // Breaking cards
  breakCard: {
    width: Math.min(width * 0.78, scale(300)),
    borderRadius: scale(16),
    marginRight: scale(14),
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  breakImage: {
    height: Math.min(height * 0.22, scale(180)),
    width: '100%',
  },
  breakImageRadius: { borderRadius: scale(16) },
  breakCaption: {
    fontSize: 18,
    fontWeight: '400',
    color: '#0F172A',
    paddingHorizontal: scale(10),
    paddingVertical: scale(12),
  },

  // List rows
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(16),
    marginBottom: scale(12),
    padding: scale(12),
    backgroundColor: '#EEF5FF', // light blue like mock
    borderRadius: scale(14),
  },
  rowLeft: { flex: 1, paddingRight: scale(10) },
  rowTitle: { fontSize: 17, fontWeight: '500', color: '#0F172A' },
  rowThumb: {
    width: scale(110),
    height: scale(86),
    borderRadius: scale(12),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    marginTop: scale(8),
  },
  metaIconImg: {
    width: scale(20), // or 16 if you prefer
    height: scale(20),
    resizeMode: 'contain',
    tintColor: '#727272',
  },

  metaIcon: { fontSize: f(13), color: '#727272' },
  metaText: { fontSize: f(13), color: '#727272' },
});
