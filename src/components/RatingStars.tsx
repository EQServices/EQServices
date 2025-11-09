import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  max = 5,
  size = 28,
  readOnly = true,
  onChange,
}) => {
  const roundedRating = Math.round(rating * 2) / 2;

  const renderStar = (index: number) => {
    const iconName =
      roundedRating >= index + 1
        ? 'star'
        : roundedRating >= index + 0.5
          ? 'star-half-full'
          : 'star-outline';

    const StarIcon = (
      <MaterialCommunityIcons
        key={index}
        name={iconName as any}
        size={size}
        color={colors.accent}
        style={styles.star}
      />
    );

    if (readOnly) {
      return StarIcon;
    }

    return (
      <TouchableOpacity key={index} onPress={() => onChange?.(index + 1)} activeOpacity={0.7}>
        {StarIcon}
      </TouchableOpacity>
    );
  };

  return <View style={styles.container}>{Array.from({ length: max }, (_, index) => renderStar(index))}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 2,
  },
});

export default RatingStars;

