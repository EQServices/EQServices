import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface SkeletonBlockProps {
  height: number;
  width?: number | string;
  style?: ViewStyle;
}

const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ height, width = '100%', style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [animatedValue]);

  const backgroundColor = useMemo(
    () =>
      animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.4)'],
      }),
    [animatedValue],
  );

  return (
    <Animated.View
      style={[
        styles.skeletonBlock,
        {
          height,
          width,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardListProps {
  count?: number;
  cardHeight?: number;
}

export const SkeletonCardList: React.FC<SkeletonCardListProps> = ({ count = 3 }) => {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <SkeletonBlock height={18} width="40%" />
          <SkeletonBlock height={14} width="60%" style={styles.blockSpacing} />
          <SkeletonBlock height={12} width="85%" style={styles.blockSpacing} />
          <SkeletonBlock height={12} width="70%" style={styles.blockSpacing} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 12,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    elevation: 2,
  },
  skeletonBlock: {
    borderRadius: 8,
  },
  blockSpacing: {
    marginTop: 8,
  },
});

export default SkeletonCardList;

