import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');
const SHEET_MAX_H = Math.round(height * 0.8);
const BACKDROP_OPACITY = 0.35;

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function BottomSheet({ visible, onClose, children }: Props) {
  const translateY = useRef(new Animated.Value(SHEET_MAX_H)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const [sheetHeight, setSheetHeight] = useState(SHEET_MAX_H);
const { colors } = useTheme();
  // --- Open / Close animations ---
  const open = () => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const close = (cb?: () => void) => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: SHEET_MAX_H, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => finished && cb?.());
  };

  // --- Handle visibility ---
  useEffect(() => {
    if (visible) open();
    else close();
  }, [visible]);

  // --- Keyboard handling ---
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setSheetHeight(SHEET_MAX_H)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setSheetHeight(SHEET_MAX_H)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // --- Pan gesture ---
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
        onPanResponderMove: Animated.event([null, { dy: translateY }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, g) => {
          if (g.dy > SHEET_MAX_H * 0.25 || g.vy > 1.2) close(onClose);
          else open();
        },
        onPanResponderGrant: () => translateY.setOffset((translateY as any)._value),
        onPanResponderEnd: () => translateY.flattenOffset(),
      }),
    [translateY]
  );

  // --- Render nothing if fully closed ---
  if (!visible && (backdrop as any)._value === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={() => close(onClose)}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'black',
              opacity: backdrop.interpolate({
                inputRange: [0, 1],
                outputRange: [0, BACKDROP_OPACITY],
              }),
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        {...pan.panHandlers}
        style={[
          styles.sheet,
          { backgroundColor: colors.card },
          { height: sheetHeight, transform: [{ translateY }] },
        ]}
      >
        <View style={styles.handle} />
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 52,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
    marginBottom: 12,
  },
});
