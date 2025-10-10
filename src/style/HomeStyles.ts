import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const baseW = 375;
export const scale = (n: number) =>
  (width / baseW) * n;
const f = (n: number) =>
  Math.round(PixelRatio.roundToNearestPixel(scale(n)));

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e3e9ee' },

  // ===== Header / Hero =====
  header: {
    width: '100%',
    paddingTop: scale(45),
    paddingBottom: scale(16),
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    justifyContent: 'space-between',
    marginTop: scale(25),
    // borderBottomColor: '#E1E1E1',
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // paddingBottom: scale(16),
    
  },
  logo: { width: scale(155), height: scale(28) },
  avatarBtn: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },

  welcomeBlock: {
    paddingHorizontal: scale(16),
    marginTop: scale(20),
  },
  welcomeHeading: {
    color: '#FFFFFF',
    fontSize: f(22),
    fontWeight: '700',
  },
  welcomeSubtitle: {
    color: '#D7E5FF',
    fontSize: f(13),
    marginTop: scale(6),
  },

  trendingHeader: {
    marginTop: scale(20),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendingTitle: {
    color: '#FFFFFF',
    fontSize: f(16),
    fontWeight: '400',
  },
  seeAll: {
    color: '#E5ECFF',
    fontSize: f(13),
    fontWeight: '600',
  },

  slideWrap: {
    width, // paging
  },
  slideCard: {
    marginHorizontal: scale(16),
    marginTop: scale(10),
    height: Math.min(height * 0.28, scale(210)),
    borderRadius: scale(14),
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  slideImage: {
    borderRadius: scale(14),
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  slideCaption: {
    color: '#FFFFFF',
    fontSize: f(16),
    fontWeight: '700',
    paddingHorizontal: scale(14),
    paddingVertical: scale(14),
  },
  dotsRow: {
    height: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: scale(6),
    marginTop: scale(6),
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: scale(16),
    backgroundColor: '#FFFFFF',
  },

  // ===== Content =====
  content: {
    flex: 1,
  },

  // Tabs
  tabsRow: {
    paddingHorizontal: 0,
    paddingTop: scale(0),
  },
  tabBtn: {
    paddingHorizontal: scale(16),
    alignItems: 'center',
  },
  tabText: {
    fontSize: f(14),
    color: '#6B7280',
    fontWeight: '600',
    paddingVertical: scale(8),
  },
  tabTextActive: {
    color: '#2260B2',
  },
  tabIndicator: {
    width: scale(70),
    height: scale(3),
    borderRadius: scale(2),
    backgroundColor: '#2260B2',
    marginBottom: scale(8),
  },
  tabIndicatorGhost: {
    width: scale(40),
    height: scale(3),
    marginBottom: scale(8),
    opacity: 0,
  },

  sectionHeaderRow: {
    marginTop: scale(6),
    paddingHorizontal: scale(16),
    marginBottom: scale(8),
  },
  sectionTitle: {
    fontSize: f(16),
    fontWeight: '700',
    color: '#0F172A',
  },

  // Ads carousel
  adCard: {
    width: Math.min(width * 0.68, 260),
    height: Math.min(height * 0.18, 140),
    marginRight: scale(12),
    borderRadius: scale(12),
    overflow: 'hidden',
  },
  adImage: {
    flex: 1,
    borderRadius: scale(12),
    justifyContent: 'flex-end',
  },
  adOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  adTitle: {
    color: '#fff',
    fontSize: f(14),
    fontWeight: '700',
    padding: scale(12),
  },

  // Article cards
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(10),
    marginBottom: scale(12),
    backgroundColor: '#F0F6FF',
    padding: scale(12),
    borderRadius: scale(12),
  },
  cardLeft: {
    flex: 1,
    paddingRight: scale(10),
  },
  cardTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '500',
  },
 
  dotSep: {
    color: '#9CA3AF',
    fontSize: f(12),
  },
  cardThumb: {
    width: width * 0.35,
    height: scale(72),
    borderRadius: scale(10),
  },
   rowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: scale(16),
      marginBottom: scale(12),
      padding: scale(12),
      marginTop: scale(5),
      backgroundColor: '#EEF5FF', // light blue like mock
      borderRadius: scale(14),
    },
    rowLeft: { flex: 1, paddingRight: scale(10) },
    rowTitle: { fontSize: 18, fontWeight: '500', color: '#0F172A',marginTop: scale(-30) },
    rowThumb: {
      width: scale(135),
      height: scale(97),
      borderRadius: scale(10),
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(5),
      marginTop: scale(8),
      marginBottom: scale(-20),
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
