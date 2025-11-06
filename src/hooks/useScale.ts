// src/hooks/useScale.ts
import { useWindowDimensions, PixelRatio, Platform } from "react-native";

export function useScale() {
  const { width, height } = useWindowDimensions();
const raw = width / 375;
// grow on tablet but cap to avoid huge UI
const factor = Math.min(Math.max(raw, 0.95), 1.25); // never > 1 (phone look)

  const s = (n: number) => factor * n;
  const f = (n: number) => Math.round(PixelRatio.roundToNearestPixel(factor * n));
  const isTablet = width >= (Platform.OS === "ios" ? 768 : 720);

  return { width, height, s, f, isTablet };
}
