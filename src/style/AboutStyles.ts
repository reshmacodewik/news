import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Helper functions for responsive sizing
export const scale = (size: number) => size * (width / 375);
export const f = (fontSize: number) => fontSize;

// Constants for layout
export const HEADER_H = height * 0.45; // Adjust header height to be 45% of screen height
export const SHEET_OVERLAP = scale(50);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ----- Header (no absolute) -----
  header: {
    width: '100%',
    height: HEADER_H,
    zIndex: 0,
    position: 'relative',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    paddingHorizontal: scale(18),
    paddingTop: scale(5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
   logo: { width: scale(155), height: scale(28),resizeMode:'contain' },
  avatarWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(20),
    backgroundColor: '#F1F5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },

  // Watermark logo in center of header
  watermarkContainer: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  watermarkLogo: {
    width: width * 0.7,
    height: scale(60),
    resizeMode: 'contain',
    opacity: 0.5,
  },

  // ----- Content -----
  scroll: {
    position: 'relative',
    overflow: 'visible',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scale(40),
    paddingTop: SHEET_OVERLAP,
  },
  sheet: {
    marginTop: -100,
    marginHorizontal: scale(16),
    backgroundColor: '#e3e9ee',
    borderRadius: scale(20),
    paddingHorizontal: scale(20),
    paddingTop: scale(24),
    paddingBottom: scale(24),
  },

  h1: {
    fontSize: f(24),
    lineHeight: f(30),
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: scale(16),
  },
  body: {
    fontSize: f(16),
    lineHeight: f(24),
    color: '#111827',
    marginBottom: scale(16),
  },
});
