import { StyleSheet, Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const BASE_W = 375;

// scaling helpers (for proportional sizing)
const scale = (n: number) => (width / BASE_W) * n;
const f = (n: number) =>
  Math.round(PixelRatio.roundToNearestPixel((width / BASE_W) * n));

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000', // fallback background
  },

  // full-screen background image
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // centers logo
  centerBox: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // responsive logo size
  logo: {
    width: '70%',
    height: scale(160),
  },
});
