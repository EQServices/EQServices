import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Menu, Portal } from 'react-native-paper';
import { IconButton } from 'react-native-paper';
import { colors } from '../theme/colors';
import {
  shareServiceRequest,
  shareViaWhatsApp,
  shareViaEmail,
  copyLinkToClipboard,
  generateServiceRequestLink,
} from '../services/sharing';

interface ShareButtonProps {
  serviceRequestId: string;
  title: string;
  category: string;
  location: string;
  variant?: 'icon' | 'button';
  size?: 'small' | 'medium' | 'large';
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  serviceRequestId,
  title,
  category,
  location,
  variant = 'icon',
  size = 'medium',
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleShare = async () => {
    const success = await shareServiceRequest(serviceRequestId, title, category, location);
    if (success) {
      setMenuVisible(false);
    }
  };

  const handleShareWhatsApp = async () => {
    const link = generateServiceRequestLink(serviceRequestId);
    const message = `Confira este pedido de serviço no Elastiquality:\n\n${title}\nCategoria: ${category}\nLocalização: ${location}`;
    const success = await shareViaWhatsApp(message, link);
    if (success) {
      setMenuVisible(false);
    }
  };

  const handleShareEmail = async () => {
    const link = generateServiceRequestLink(serviceRequestId);
    const subject = `Pedido de Serviço: ${title}`;
    const body = `Confira este pedido de serviço no Elastiquality:\n\nTítulo: ${title}\nCategoria: ${category}\nLocalização: ${location}\n\nVeja mais detalhes:`;
    const success = await shareViaEmail(subject, body, link);
    if (success) {
      setMenuVisible(false);
    }
  };

  const handleCopyLink = async () => {
    const link = generateServiceRequestLink(serviceRequestId);
    const success = await copyLinkToClipboard(link);
    if (success) {
      setMenuVisible(false);
    }
  };

  if (variant === 'icon') {
    return (
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon="share-variant"
            iconColor={colors.text}
            size={24}
            onPress={() => setMenuVisible(true)}
          />
        }
      >
        <Menu.Item onPress={handleShare} title="Compartilhar" leadingIcon="share-variant" />
        {Platform.OS !== 'web' && (
          <Menu.Item
            onPress={handleShareWhatsApp}
            title="WhatsApp"
            leadingIcon="whatsapp"
          />
        )}
        <Menu.Item onPress={handleShareEmail} title="Email" leadingIcon="email" />
        <Menu.Item onPress={handleCopyLink} title="Copiar link" leadingIcon="content-copy" />
      </Menu>
    );
  }

  return (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <Button
          mode="outlined"
          icon="share-variant"
          onPress={() => setMenuVisible(true)}
          style={styles.button}
        >
          Compartilhar
        </Button>
      }
    >
      <Menu.Item onPress={handleShare} title="Compartilhar" leadingIcon="share-variant" />
      {Platform.OS !== 'web' && (
        <Menu.Item onPress={handleShareWhatsApp} title="WhatsApp" leadingIcon="whatsapp" />
      )}
      <Menu.Item onPress={handleShareEmail} title="Email" leadingIcon="email" />
      <Menu.Item onPress={handleCopyLink} title="Copiar link" leadingIcon="content-copy" />
    </Menu>
  );
};

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 8,
  },
});

