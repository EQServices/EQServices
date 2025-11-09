import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import * as ImagePickerLib from 'expo-image-picker';
import { colors } from '../theme/colors';

export interface ImagePickerItem {
  uri: string;
  local?: boolean;
}

interface ImagePickerProps {
  title?: string;
  subtitle?: string;
  images: ImagePickerItem[];
  onChange: (items: ImagePickerItem[]) => void;
  maxImages?: number;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  title = 'Fotos',
  subtitle = 'Adicione imagens relacionadas (até 5).',
  images,
  onChange,
  maxImages = 5,
}) => {
  const remainingSlots = Math.max(0, maxImages - images.length);

  const handleAddImages = async () => {
    if (remainingSlots <= 0) {
      Alert.alert('Limite atingido', `Só é possível adicionar até ${maxImages} imagens.`);
      return;
    }

    const { status } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso às suas fotos para permitir o upload. Verifique as permissões nas definições do dispositivo.',
      );
      return;
    }

    const result = await ImagePickerLib.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const selectedAssets = (result.assets || [])
      .filter((asset) => asset.uri)
      .map((asset) => ({
        uri: asset.uri!,
        local: true,
      }));

    if (selectedAssets.length === 0) {
      return;
    }

    const existingUris = new Set(images.map((item) => item.uri));
    const newItems: ImagePickerItem[] = [];

    selectedAssets.forEach((asset) => {
      if (!existingUris.has(asset.uri)) {
        newItems.push(asset);
      }
    });

    if (newItems.length > 0) {
      onChange([...images, ...newItems]);
    }
  };

  const handleRemove = (uri: string) => {
    onChange(images.filter((item) => item.uri !== uri));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.grid}>
        {images.map((item) => (
          <View key={item.uri} style={styles.imageWrapper}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            <IconButton
              icon="close-circle"
              size={22}
              iconColor={colors.error}
              style={styles.removeButton}
              onPress={() => handleRemove(item.uri)}
            />
          </View>
        ))}

        {remainingSlots > 0 ? (
          <TouchableOpacity style={styles.addButton} onPress={handleAddImages} activeOpacity={0.7}>
            <IconButton icon="camera-plus" size={32} iconColor={colors.primary} />
            <Text style={styles.addLabel}>Adicionar</Text>
            <Text style={styles.remaining}>{remainingSlots} restantes</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: 8,
  },
  addLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  remaining: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});

export default ImagePicker;

