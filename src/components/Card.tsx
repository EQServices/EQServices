import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard, CardProps as PaperCardProps } from 'react-native-paper';
import { colors } from '../theme/colors';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'flat';

export interface CardProps extends PaperCardProps {
  variant?: CardVariant;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding,
  style,
  contentStyle,
  ...props
}) => {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'flat' && styles.flat,
    style,
  ];

  const cardContentStyle = [
    padding !== undefined && { padding },
    contentStyle,
  ];

  return (
    <PaperCard style={cardStyle} contentStyle={cardContentStyle} {...props} />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginVertical: 4,
  },
  elevated: {
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 0,
  },
  flat: {
    elevation: 0,
    backgroundColor: colors.background,
  },
});

export default Card;

