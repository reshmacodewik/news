import { StyleSheet, Dimensions, Platform } from 'react-native';
const AVATAR = 120;
const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;
const f = (size: number) => scale(size);

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3e9ee',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    paddingBottom: 28,
  },

  /* Header */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#E1E1E1',
  },

  backButton: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    width: scale(20),
    height: scale(20),
    tintColor: '#374151',
  },

  navTitle: {
    fontSize: f(18),
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  placeholder: {
    width: scale(40),
  },

  /* Profile */
  profileSection: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 22,
  },
  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  userIcon: {
    width: AVATAR * 0.9,
    height: AVATAR * 0.9,
  },
  gradientAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userGlyph: {
    width: AVATAR * 0.5,
    height: AVATAR * 0.5,
    borderRadius: AVATAR * 0.25,
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginBottom: 8,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cameraIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
  cameraBadgeText: { fontSize: 14 },

  profileName: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '700',
    color: '#1B1F2A',
  },

  /* Form */
  formSection: {
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
    opacity: 0.9,
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6EAF2',
    backgroundColor: '#F5FAFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 15,
    color: '#0B1220',
    marginBottom: 14,
  },

  /* Save button */
  saveButton: {
    backgroundColor: '#031B38',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: '65%',
    width: Math.min(width * 0.92, 560),
    alignSelf: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
