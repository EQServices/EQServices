import React from 'react';
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface AppLogoProps {
  size?: number;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  showText?: boolean;
  withBackground?: boolean;
}

const logoSource = require('../../assets/images/logo.png');

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 120,
  containerStyle,
  imageStyle,
  showText = false,
  withBackground = false,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.logoWrapper, withBackground && styles.logoBackground, { width: size, height: size }]}>
        <Image 
          source={logoSource} 
          style={[
            styles.logo, 
            { width: size * 0.9, height: size * 0.9 }, 
            imageStyle
          ]} 
        />
      </View>
      {showText ? (
        <Text style={styles.logoText} variant="titleLarge">
          Elastiquality
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  logoBackground: {
    backgroundColor: colors.background,
    padding: 8,
  },
  logo: {
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  logoText: {
    marginTop: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default AppLogo;

