import React from 'react';
import { View, Image, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface ImageGalleryProps {
  images: string[];
  emptyLabel?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, emptyLabel = 'Sem imagens disponíveis.' }) => {
  if (!images || images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    gap: 12,
    paddingVertical: 4,
  },
  image: {
    width: 160,
    height: 120,
    borderRadius: 12,
  },
  emptyContainer: {
    paddingVertical: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default ImageGallery;

