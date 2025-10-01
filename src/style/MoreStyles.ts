import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 375;
export const scale = (n: number) => (width / BASE_W) * n;
const f = (n: number) => Math.round(PixelRatio.roundToNearestPixel(scale(n)));

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { flex: 1, backgroundColor: '#F7F7FA' },

  // Top bar
  topBar: {
    height: scale(56),
    paddingHorizontal: scale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#ECEFF3',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: { width: scale(160), height: scale(28) },
  avatarWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    overflow: 'hidden',
    backgroundColor: '#F1F5FF',
  },
  avatar: { width: '100%', height: '100%' },

  // Profile card
  profileCard: {
    marginTop: scale(12),
    marginHorizontal: scale(16),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    padding: scale(14),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bigAvatarWrap: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    overflow: 'hidden',
    marginRight: scale(14),
    backgroundColor: '#F3F4F6',
  },
  bigAvatar: { width: '100%', height: '100%' },
  profileInfo: { flex: 1 },
  name: {
    fontSize: f(20),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: scale(6),
  },
  line: { flexDirection: 'row', alignItems: 'center', marginBottom: scale(6) },
  smallIcon: {
    width: scale(16),
    height: scale(16),
    resizeMode: 'contain',
    tintColor: '#6B7280',
    marginRight: scale(8),
  },
  lineText: { fontSize: f(14), color: '#111827' },

  editBtn: {
    marginTop: scale(12),
    alignSelf: 'stretch',
    backgroundColor: '#EAF2FF',
    borderRadius: scale(10),
    height: scale(40),
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    justifyContent: 'center',
    gap: scale(8),
  },
  editIcon: { width: scale(16), height: scale(16), tintColor: '#000' },
  editText: { color: '#000', fontWeight: '500', fontSize: f(14) },

  // Section title
  sectionTitle: {
    marginTop: scale(18),
    marginBottom: scale(8),
    marginHorizontal: scale(16),
    fontSize: 20,
    fontWeight: '500',
    color: '#0F172A',
  },

  // Card groups
  cardGroup: {
    marginHorizontal: scale(16),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: '#E1E1E1',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  row: {
    minHeight: scale(54),
    paddingHorizontal: scale(14),
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: '#111827',
    marginRight: scale(12),
    marginTop: scale(8),
  },
  rowLabel: { flex: 1, fontSize: f(16), color: '#111827', marginTop: scale(8) },
  chevron: { width: scale(20), height: scale(16) },

  contactBody: {
    color: '#6B7280',
    fontSize: f(14),
    lineHeight: f(21),
    marginTop: scale(4),
  },
  link: { color: '#2563EB', textDecorationLine: 'underline' },
  subtle: {
    color: '#6B7280',
    fontSize: f(13),
    marginTop: scale(0),
    marginBottom: scale(15),
  },

  logoutRow: {
    marginHorizontal: scale(16),
    marginTop: scale(8),
    marginBottom: scale(16),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(16),
    paddingHorizontal: scale(14),
    borderWidth: 1,
    borderColor: '#E1E1E1',
    minHeight: scale(54),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  logoutIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: '#EF4444',
    marginRight: scale(12),
  },
  // bottom-sheet content (reuses your scale/f helpers)
  sheetTitle: {
    fontSize: f(18),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: scale(6),
    marginTop: scale(15),
  },
  sheetSub: {
    fontSize: f(13.5),
    color: '#6B7280',
    lineHeight: f(20),
    marginBottom: scale(14),
  },
  boldEmail: { color: '#111827', fontWeight: '700' },

  inputLabel: {
    fontSize: f(14),
    fontWeight: '600',
    color: '#111827',
    marginBottom: scale(6),
  },
  input: {
    height: scale(46),
    borderRadius: scale(12),
    backgroundColor: '#F0F6FF',
    paddingHorizontal: scale(14),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
    marginBottom: scale(12),
  },
  primaryBtn: {
    paddingVertical: scale(12),
    borderRadius: scale(12),
    backgroundColor: '#0B2034',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: f(15) },

  logoutText: { color: '#EF4444', fontSize: f(16), fontWeight: '700' },
});
