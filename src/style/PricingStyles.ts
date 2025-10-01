import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 375;

export const scale = (n: number) => (width / BASE_W) * n;
const f = (n: number) => Math.round(PixelRatio.roundToNearestPixel(scale(n)));

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1, backgroundColor: '#FFFFFF',marginBottom: scale(25) },

  // Top bar
  topBar: {
    height: scale(56),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#EAECEF',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: { width: scale(160), height: scale(28) },
  avatarWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: '#F1F5FF',
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },

  pageTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#0F172A',
    marginTop: scale(18),
    marginBottom: scale(12),
    paddingHorizontal: scale(16),
  },

  // Plan card (outer)
  planCard: {
    marginHorizontal: scale(16),
    marginBottom: scale(16),
    borderRadius: scale(20),
    backgroundColor: '#2260B2',
    // shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  planCardHighlight: {
    padding: scale(2), // for blue border effect
    backgroundColor: '#2260B2',
  
  },

  ribbon: {
 
    top: scale(0),
    left: scale(0),
    right: scale(0),
    padding: scale(9),
    borderTopLeftRadius: scale(12),
    borderTopRightRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  ribbonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: f(12),
    letterSpacing: 0.3,
  },

  // Inner white card
  innerCard: {
    borderRadius: scale(18),
    backgroundColor: '#FFFFFF',
    padding: scale(15),
    paddingHorizontal:scale(22),
    paddingBottom: scale(18),
    borderTopLeftRadius: scale(18),
    borderTopRightRadius: scale(18),
   
  },

  planTitle: {
    fontSize: f(18),
    fontWeight: '800',
    color: '#0F172A',
  },
  planSubtitle: {
    marginTop: scale(4),
    color: '#6B7280',
    fontSize: f(14),
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: scale(10),
    marginBottom: scale(0),
  },
  price: { fontSize: f(36), fontWeight: '800', color: '#0F172A' },
  cadence: {
    marginLeft: scale(8),
    marginBottom: scale(15),
    color: '#000',
    fontSize: f(16),
    fontWeight: '700',
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(8),
  },
  featureIcon: {
    width: scale(16),
    height: scale(16),
    resizeMode: 'contain',

    marginRight: scale(10),
  },
  featureIconBlue: {},
  featureText: {
    fontSize: f(15),
    color: '#111827',
  },
  featureTextBold: {
    fontWeight: '700',
  },

  ctaBtn: {
    marginTop: scale(18),
    height: scale(46),
    borderRadius: scale(23),
    backgroundColor: '#2E2F32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFFFFF', fontWeight: '700', fontSize: f(15) },

  underLink: {
    marginTop: scale(10),
    textAlign: 'center',
    color: '#333333',
    fontSize: f(13),
  },
  link: { color: '#333333', textDecorationLine: 'underline' },
});
