import React from 'react';
import { FAB } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

interface HelpFABProps {
  visible?: boolean;
}

export const HelpFAB: React.FC<HelpFABProps> = ({ visible = true }) => {
  const navigation = useNavigation();

  if (!visible) return null;

  return (
    <FAB
      icon="help-circle"
      style={styles.fab}
      color={colors.textLight}
      onPress={() => (navigation as any).navigate('Help')}
      label="Ajuda"
      small
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

