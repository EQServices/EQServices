import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  HelperText,
  List,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { colors } from '../theme/colors';
import {
  LocationOption,
  LocationSelection,
  formatLocationSelection,
  searchDistricts,
  searchMunicipalities,
  searchParishes,
} from '../services/locations';
import { ensureLocationsSeeded } from '../services/locationSync';

type LocationLevel = 'district' | 'municipality' | 'parish';

const levelConfig: Record<
  LocationLevel,
  {
    label: string;
    description: string;
  }
> = {
  district: {
    label: 'Distrito',
    description: 'Selecione o distrito.',
  },
  municipality: {
    label: 'Concelho',
    description: 'Selecione o concelho (município).',
  },
  parish: {
    label: 'Freguesia',
    description: 'Selecione a freguesia.',
  },
};

interface LocationPickerProps {
  value: LocationSelection;
  onChange: (selection: LocationSelection) => void;
  error?: string;
  style?: any;
  requiredLevel?: LocationLevel;
  caption?: string;
}

const emptySelection: LocationSelection = {};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  error,
  style,
  requiredLevel = 'district',
  caption,
}) => {
  const selection = value ?? emptySelection;

  const [dialogLevel, setDialogLevel] = useState<LocationLevel | null>(null);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncAttempted, setSyncAttempted] = useState(false);

  const resolvedValue = useMemo<LocationSelection>(() => selection, [selection]);

  const closeDialog = () => {
    setDialogLevel(null);
    setQuery('');
    setOptions([]);
    setDialogError(null);
  };

  const handleOpenDialog = (level: LocationLevel) => {
    if (level === 'municipality' && !resolvedValue.districtId) {
      setDialogError('Selecione primeiro um distrito.');
      setDialogLevel('municipality');
      return;
    }

    if (level === 'parish' && !resolvedValue.municipalityId) {
      setDialogError('Selecione primeiro um concelho.');
      setDialogLevel('parish');
      return;
    }

    setQuery('');
    setOptions([]);
    setDialogError(null);
    setDialogLevel(level);
    if (!syncAttempted) {
      setSyncing(true);
      ensureLocationsSeeded()
        .catch((err: any) => {
          console.error('Erro a sincronizar localizações:', err);
          setDialogError(err.message || 'Não foi possível sincronizar os dados de localização.');
        })
        .finally(() => {
          setSyncing(false);
          setSyncAttempted(true);
        });
    }
  };

  const handleSelectOption = (option: LocationOption) => {
    if (!dialogLevel) return;

    if (dialogLevel === 'district') {
      onChange({
        districtId: option.id,
        districtName: option.name,
        municipalityId: undefined,
        municipalityName: undefined,
        parishId: undefined,
        parishName: undefined,
      });
    } else if (dialogLevel === 'municipality') {
      onChange({
        ...resolvedValue,
        municipalityId: option.id,
        municipalityName: option.name,
        parishId: undefined,
        parishName: undefined,
      });
    } else if (dialogLevel === 'parish') {
      onChange({
        ...resolvedValue,
        parishId: option.id,
        parishName: option.name,
      });
    }

    closeDialog();
  };

  const clearLevel = (level: LocationLevel) => {
    if (level === 'district') {
      onChange({});
    } else if (level === 'municipality') {
      onChange({
        ...resolvedValue,
        municipalityId: undefined,
        municipalityName: undefined,
        parishId: undefined,
        parishName: undefined,
      });
    } else if (level === 'parish') {
      onChange({
        ...resolvedValue,
        parishId: undefined,
        parishName: undefined,
      });
    }
  };

  const fetchOptions = useCallback(async () => {
    if (!dialogLevel) return;

    const ensureSynced = async () => {
      if (syncAttempted) {
        return false;
      }
      setSyncing(true);
      try {
        await ensureLocationsSeeded();
        setSyncAttempted(true);
        return true;
      } catch (syncErr: any) {
        console.error('Erro durante sincronização automática:', syncErr);
        setDialogError(syncErr.message || 'Falha ao sincronizar dados de localização.');
        return false;
      } finally {
        setSyncing(false);
      }
    };

    try {
      setLoading(true);
      setDialogError(null);

      let results: LocationOption[] = [];
      if (dialogLevel === 'district') {
        results = await searchDistricts(query);
      } else if (dialogLevel === 'municipality') {
        if (!resolvedValue.districtId) {
          setDialogError('Selecione primeiro um distrito.');
          setOptions([]);
          setLoading(false);
          return;
        }
        results = await searchMunicipalities(resolvedValue.districtId, query);
      } else if (dialogLevel === 'parish') {
        if (!resolvedValue.municipalityId) {
          setDialogError('Selecione primeiro um concelho.');
          setOptions([]);
          setLoading(false);
          return;
        }
        results = await searchParishes(resolvedValue.municipalityId, query);
      }

      setOptions(results);

      if (results.length === 0) {
        const synced = await ensureSynced();
        if (synced) {
          await fetchOptions();
          return;
        }
      }
    } catch (err: any) {
      console.error('Erro ao carregar localizações:', err);
      setDialogError(err.message || 'Não foi possível carregar os dados.');
      const synced = await ensureSynced();
      if (synced) {
        await fetchOptions();
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [dialogLevel, resolvedValue, query, syncAttempted]);

  useEffect(() => {
    if (!dialogLevel) return;

    const debounce = setTimeout(() => {
      fetchOptions();
    }, 200);

    return () => clearTimeout(debounce);
  }, [dialogLevel, query, fetchOptions]);

  const requiredMessage = useMemo(() => {
    if (!requiredLevel) return null;

    if (requiredLevel === 'parish' && !resolvedValue.parishId) {
      return 'Selecione pelo menos uma freguesia.';
    }
    if (requiredLevel === 'municipality' && !resolvedValue.municipalityId) {
      return 'Selecione pelo menos um concelho.';
    }
    if (requiredLevel === 'district' && !resolvedValue.districtId) {
      return 'Selecione pelo menos um distrito.';
    }
    return null;
  }, [requiredLevel, resolvedValue]);

  const helper = error ?? requiredMessage ?? caption ?? undefined;
  const helperType = error ? 'error' : 'info';

  return (
    <View style={[styles.container, style]}>
      <TextInput
        mode="outlined"
        label="Distrito"
        value={resolvedValue.districtName ?? ''}
        editable={false}
        onPressIn={() => handleOpenDialog('district')}
        right={
          resolvedValue.districtName ? (
            <TextInput.Icon icon="close" onPress={() => clearLevel('district')} forceTextInputFocus={false} />
          ) : undefined
        }
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Concelho"
        value={resolvedValue.municipalityName ?? ''}
        editable={false}
        onPressIn={() => handleOpenDialog('municipality')}
        right={
          resolvedValue.municipalityName ? (
            <TextInput.Icon icon="close" onPress={() => clearLevel('municipality')} forceTextInputFocus={false} />
          ) : undefined
        }
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Freguesia"
        value={resolvedValue.parishName ?? ''}
        editable={false}
        onPressIn={() => handleOpenDialog('parish')}
        right={
          resolvedValue.parishName ? (
            <TextInput.Icon icon="close" onPress={() => clearLevel('parish')} forceTextInputFocus={false} />
          ) : undefined
        }
        style={styles.input}
      />

      {helper ? (
        <HelperText type={helperType as 'error' | 'info'} visible>
          {helper}
        </HelperText>
      ) : null}

      <Text style={styles.previewLabel}>Resumo selecionado</Text>
      <Text style={styles.previewValue}>{formatLocationSelection(resolvedValue) || 'Nenhuma seleção feita.'}</Text>

      <Portal>
        <Dialog visible={dialogLevel !== null} onDismiss={closeDialog}>
          <Dialog.Title>
            {dialogLevel ? levelConfig[dialogLevel].label : ''} {dialogLevel ? '' : ''}
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {dialogLevel ? (
              <>
                <Text style={styles.dialogDescription}>{levelConfig[dialogLevel].description}</Text>
                <TextInput
                  mode="outlined"
                  label="Pesquisar"
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  style={styles.searchInput}
                  placeholder="Digite para filtrar"
                />
                {dialogError ? <HelperText type="error">{dialogError}</HelperText> : null}
                {loading ? (
                  <View style={styles.loader}>
                    <ActivityIndicator animating color={colors.primary} />
                    <Text style={styles.loaderText}>A carregar opções...</Text>
                  </View>
                ) : syncing ? (
                  <View style={styles.loader}>
                    <ActivityIndicator animating color={colors.primary} />
                    <Text style={styles.loaderText}>A sincronizar dados de localização...</Text>
                  </View>
                ) : (
                  <View style={styles.listWrapper}>
                    {options.length === 0 ? (
                      <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
                    ) : (
                      options.map((option) => (
                        <List.Item
                          key={option.id}
                          title={option.name}
                          onPress={() => handleSelectOption(option)}
                          left={(props) => <List.Icon {...props} icon="map-marker" />}
                        />
                      ))
                    )}
                  </View>
                )}
              </>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Fechar</Button>
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
  input: {
    backgroundColor: colors.background,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  previewValue: {
    fontSize: 14,
    color: colors.text,
  },
  dialogContent: {
    gap: 12,
  },
  dialogDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchInput: {
    backgroundColor: colors.background,
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loaderText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  listWrapper: {
    maxHeight: 320,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default LocationPicker;

