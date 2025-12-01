import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native-paper';
import { AppLogo } from './AppLogo';
import { colors } from '../theme/colors';

interface SplashOverlayProps {
  duration?: number;
  onFinish?: () => void;
}

export const SplashOverlay: React.FC<SplashOverlayProps> = ({ duration = 1200, onFinish }) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        onFinish?.();
      });
    }, duration);

    return () => {
      clearTimeout(timer);
      opacity.stopAnimation();
    };
  }, [duration, opacity, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <AppLogo size={200} withBackground showText />
          <Text style={styles.tagline}>Conectando talentos e oportunidades</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 24,
  },
  tagline: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    maxWidth: 260,
  },
});

export default SplashOverlay;

