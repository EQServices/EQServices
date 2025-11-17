import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton, ButtonProps as PaperButtonProps } from 'react-native-paper';
import { colors } from '../theme/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger' | 'success';

export interface ButtonProps extends Omit<PaperButtonProps, 'buttonColor' | 'textColor' | 'mode'> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const getVariantStyles = (variant: ButtonVariant): { buttonColor?: string; textColor?: string; mode: 'contained' | 'outlined' | 'text' } => {
  switch (variant) {
    case 'primary':
      return {
        mode: 'contained',
        buttonColor: colors.primary,
        textColor: colors.textLight,
      };
    case 'secondary':
      return {
        mode: 'contained',
        buttonColor: colors.secondary,
        textColor: colors.text,
      };
    case 'outline':
      return {
        mode: 'outlined',
        buttonColor: 'transparent',
        textColor: colors.primary,
      };
    case 'text':
      return {
        mode: 'text',
        textColor: colors.primary,
      };
    case 'danger':
      return {
        mode: 'contained',
        buttonColor: colors.error,
        textColor: colors.textLight,
      };
    case 'success':
      return {
        mode: 'contained',
        buttonColor: colors.success,
        textColor: colors.textLight,
      };
    default:
      return {
        mode: 'contained',
        buttonColor: colors.primary,
        textColor: colors.textLight,
      };
  }
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  style,
  contentStyle,
  labelStyle,
  ...props
}) => {
  const variantStyles = getVariantStyles(variant);
  const buttonStyle = [styles.button, fullWidth && styles.fullWidth, style];
  const buttonContentStyle = [styles.contentStyle, contentStyle];
  const buttonLabelStyle = [styles.labelStyle, labelStyle];

  return (
    <PaperButton
      {...props}
      mode={variantStyles.mode}
      buttonColor={variantStyles.buttonColor}
      textColor={variantStyles.textColor}
      style={buttonStyle}
      contentStyle={buttonContentStyle}
      labelStyle={buttonLabelStyle}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  fullWidth: {
    width: '100%',
  },
  contentStyle: {
    paddingVertical: 6,
  },
  labelStyle: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;

