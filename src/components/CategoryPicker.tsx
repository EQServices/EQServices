import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Dialog, HelperText, List, Portal, Text, TextInput, Chip } from 'react-native-paper';
import { colors } from '../theme/colors';
import { ALL_SERVICES, getServiceGroup, SERVICE_CATEGORY_GROUPS } from '../constants/categories';

interface CategoryPickerProps {
  value: string[];
  onChange: (categories: string[]) => void;
  error?: string;
  style?: any;
  label?: string;
  caption?: string;
  multiple?: boolean;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  error,
  style,
  label = 'Categoria',
  caption,
  multiple = true,
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState<string[]>([]);

  const helper = error ?? caption ?? undefined;
  const helperType = error ? 'error' : 'info';

  const displayValue = useMemo(() => {
    if (value.length === 0) return '';
    if (value.length === 1) return value[0];
    return `${value.length} categorias selecionadas`;
  }, [value]);

  const closeDialog = () => {
    setDialogVisible(false);
    setQuery('');
  };

  const handleOpenDialog = () => {
    setQuery('');
    setDialogVisible(true);
  };

  const filterServices = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setFilteredServices(ALL_SERVICES);
      return;
    }

    const queryLower = searchQuery.toLowerCase().trim();
    const filtered = ALL_SERVICES.filter((service) =>
      service.toLowerCase().includes(queryLower)
    );
    setFilteredServices(filtered);
  }, []);

  useEffect(() => {
    if (!dialogVisible) return;

    const debounce = setTimeout(() => {
      filterServices(query);
    }, 200);

    return () => clearTimeout(debounce);
  }, [dialogVisible, query, filterServices]);

  useEffect(() => {
    if (dialogVisible) {
      setFilteredServices(ALL_SERVICES);
    }
  }, [dialogVisible]);

  const handleSelectCategory = (category: string) => {
    if (multiple) {
      if (value.includes(category)) {
        onChange(value.filter((c) => c !== category));
      } else {
        onChange([...value, category]);
      }
    } else {
      onChange([category]);
      closeDialog();
    }
  };

  const clearSelection = () => {
    onChange([]);
  };

  const removeCategory = (category: string) => {
    onChange(value.filter((c) => c !== category));
  };

  const getCategoryGroup = (service: string) => {
    return getServiceGroup(service)?.name || 'Outros';
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputWrapper}>
        <TextInput
          mode="outlined"
          label={label}
          value={displayValue}
          editable={false}
          right={
            displayValue
              ? <TextInput.Icon icon="close" onPress={clearSelection} forceTextInputFocus={false} />
              : undefined
          }
          style={styles.input}
          pointerEvents="none"
        />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleOpenDialog}
          android_ripple={Platform.OS === 'android' ? { color: colors.overlay } : undefined}
        />
      </View>

      {value.length > 0 && (
        <View style={styles.selectedChips}>
          {value.map((category) => (
            <Chip
              key={category}
              onClose={() => removeCategory(category)}
              style={styles.selectedChip}
              textStyle={styles.selectedChipText}
            >
              {category}
            </Chip>
          ))}
        </View>
      )}

      {helper ? (
        <HelperText type={helperType as 'error' | 'info'} visible>
          {helper}
        </HelperText>
      ) : null}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog} style={styles.dialog}>
          <Dialog.Title>Selecionar {multiple ? 'Categorias' : 'Categoria'}</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text style={styles.dialogDescription}>
              Digite para pesquisar categorias. {multiple ? 'Você pode selecionar múltiplas categorias.' : 'Selecione uma categoria.'}
            </Text>
            <TextInput
              mode="outlined"
              label="Pesquisar categoria"
              value={query}
              onChangeText={setQuery}
              autoFocus
              style={styles.searchInput}
              placeholder="Ex: Pintor, Eletricista, Limpeza..."
            />
            <View style={styles.listWrapper}>
              {filteredServices.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma categoria encontrada.</Text>
              ) : (
                filteredServices.map((service) => {
                  const isSelected = value.includes(service);
                  const groupName = getCategoryGroup(service);
                  return (
                    <List.Item
                      key={service}
                      title={service}
                      description={groupName}
                      onPress={() => handleSelectCategory(service)}
                      left={(props) => (
                        <List.Icon
                          {...props}
                          icon={isSelected ? 'check-circle' : 'circle-outline'}
                          color={isSelected ? colors.primary : colors.textSecondary}
                        />
                      )}
                      style={[
                        styles.listItem,
                        isSelected && styles.listItemSelected,
                      ]}
                    />
                  );
                })
              )}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Text onPress={closeDialog} style={styles.dialogAction}>
              Fechar
            </Text>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.surface,
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  selectedChip: {
    backgroundColor: colors.primaryLight,
  },
  selectedChipText: {
    color: colors.primary,
    fontSize: 12,
  },
  dialog: {
    maxHeight: '80%',
  },
  dialogContent: {
    paddingHorizontal: 0,
    maxHeight: 400,
  },
  dialogDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  listWrapper: {
    maxHeight: 300,
  },
  listItem: {
    paddingVertical: 8,
  },
  listItemSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    padding: 20,
    fontSize: 14,
  },
  dialogAction: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    padding: 8,
  },
});

