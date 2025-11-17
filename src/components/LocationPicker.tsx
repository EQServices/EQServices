import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, Alert } from 'react-native';
import { ActivityIndicator, Button, Dialog, HelperText, List, Portal, Text, TextInput } from 'react-native-paper';
import { colors } from '../theme/colors';
import {
  LocationOption,
  LocationSelection,
  formatLocationSelection,
  searchDistricts,
  searchParishesWithParents,
} from '../services/locations';
import { ensureLocationsSeeded } from '../services/locationSync';
import { getCurrentLocation, Coordinates } from '../services/geolocation';

interface LocationPickerProps {
  value: LocationSelection;
  onChange: (selection: LocationSelection) => void;
  onCoordinatesChange?: (coordinates: Coordinates | null) => void;
  error?: string;
  style?: any;
  mode?: 'parish' | 'district';
  label?: string;
  caption?: string;
  enableGPS?: boolean;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  onCoordinatesChange,
  error,
  style,
  mode = 'parish',
  label,
  caption,
  enableGPS = false,
}) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [syncAttempted, setSyncAttempted] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const resolvedValue = useMemo<LocationSelection>(() => value ?? {}, [value]);

  const helper = error ?? caption ?? undefined;
  const helperType = error ? 'error' : 'info';

  const displayValue = useMemo(() => {
    if (mode === 'district') {
      return resolvedValue.districtName ?? '';
    }
    return formatLocationSelection(resolvedValue);
  }, [mode, resolvedValue]);

  const inputLabel =
    label ?? (mode === 'district' ? 'Distrito de atendimento' : 'Freguesia, Concelho e Distrito');

  const closeDialog = () => {
    setDialogVisible(false);
    setQuery('');
    setOptions([]);
    setDialogError(null);
  };

  const handleOpenDialog = () => {
    setQuery('');
    setOptions([]);
    setDialogError(null);
    setDialogVisible(true);
    if (!syncAttempted) {
      setSyncAttempted(true);
      ensureLocationsSeeded().catch((err: any) => {
        console.warn('Falha ao sincronizar localizações (vai continuar com dados existentes):', err);
        setDialogError((current) => current ?? 'Não foi possível sincronizar novos dados de localização. Pode continuar a pesquisar normalmente.');
      });
    }
  };

  const fetchOptions = useCallback(async () => {
    if (!dialogVisible) return;

    try {
      setLoading(true);
      setDialogError(null);

      let results: LocationOption[] = [];
      if (mode === 'district') {
        results = await searchDistricts(query);
      } else {
        const parishResults = await searchParishesWithParents(query);
        results = parishResults.map((item) => ({
          id: item.parishId,
          name: item.parishName,
          municipalityId: item.municipalityId,
          municipalityName: item.municipalityName,
          districtId: item.districtId,
          districtName: item.districtName,
        }));
      }

      setOptions(results);
    } catch (err: any) {
      console.error('Erro ao carregar localizações:', err);
      setDialogError(err.message || 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [dialogVisible, mode, query]);

  useEffect(() => {
    if (!dialogVisible) return;

    const debounce = setTimeout(() => {
      fetchOptions();
    }, 200);

    return () => clearTimeout(debounce);
  }, [dialogVisible, query, fetchOptions]);

  const handleSelectOption = (option: any) => {
    if (mode === 'district') {
      onChange({
        districtId: option.id,
        districtName: option.name,
        municipalityId: undefined,
        municipalityName: undefined,
        parishId: undefined,
        parishName: undefined,
      });
    } else {
      onChange({
        districtId: option.districtId,
        districtName: option.districtName,
        municipalityId: option.municipalityId,
        municipalityName: option.municipalityName,
        parishId: option.id,
        parishName: option.name,
      });
    }
    closeDialog();
  };

  const clearSelection = () => {
    onChange({});
    if (onCoordinatesChange) {
      onCoordinatesChange(null);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Não disponível', 'A localização GPS não está disponível na versão web.');
      return;
    }

    try {
      setGettingLocation(true);
      setDialogError(null);

      const coordinates = await getCurrentLocation();
      
      if (!coordinates) {
        return; // Erro já foi tratado em getCurrentLocation
      }

      // Notificar sobre coordenadas obtidas
      if (onCoordinatesChange) {
        onCoordinatesChange(coordinates);
      }

      // TODO: Implementar geocodificação reversa para encontrar freguesia/distrito
      // Por enquanto, apenas informamos o usuário que precisa selecionar manualmente
      Alert.alert(
        'Localização obtida',
        `Coordenadas: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}\n\nPor favor, selecione sua freguesia abaixo para completar o cadastro.`,
      );

      // Fechar dialog para que o usuário possa selecionar manualmente
      // A coordenada já foi salva via onCoordinatesChange
    } catch (err: any) {
      console.error('Erro ao obter localização:', err);
      setDialogError('Não foi possível obter sua localização. Tente selecionar manualmente.');
    } finally {
      setGettingLocation(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputWrapper}>
        <TextInput
          mode="outlined"
          label={inputLabel}
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

      {helper ? (
        <HelperText type={helperType as 'error' | 'info'} visible>
          {helper}
        </HelperText>
      ) : null}

      {mode === 'parish' ? (
        <>
          <Text style={styles.previewLabel}>Resumo selecionado</Text>
          <Text style={styles.previewValue}>{displayValue || 'Nenhuma seleção feita.'}</Text>
        </>
      ) : null}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={closeDialog}>
          <Dialog.Title>
            {mode === 'district' ? 'Selecionar distrito' : 'Selecionar freguesia'}
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text style={styles.dialogDescription}>
              {mode === 'district'
                ? 'Pesquise pelo distrito de atendimento.'
                : 'Pesquise pela freguesia. O concelho e distrito serão preenchidos automaticamente.'}
            </Text>
            {enableGPS && mode === 'parish' && Platform.OS !== 'web' && (
              <Button
                mode="outlined"
                icon="crosshairs-gps"
                onPress={handleUseCurrentLocation}
                loading={gettingLocation}
                disabled={gettingLocation}
                style={styles.gpsButton}
              >
                Usar minha localização atual
              </Button>
            )}
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
                <Text style={styles.loaderText}>
                  A carregar opções...
                </Text>
              </View>
            ) : (
              <View style={styles.listWrapper}>
                {options.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum resultado encontrado.</Text>
                ) : (
                  options.map((option: any) => (
                    <List.Item
                      key={option.id}
                      title={
                        mode === 'district'
                          ? option.name
                          : `${option.name} (${option.municipalityName})`
                      }
                      description={mode === 'district' ? undefined : option.districtName}
                      onPress={() => handleSelectOption(option)}
                      left={(props) => <List.Icon {...props} icon="map-marker" />}
                    />
                  ))
                )}
              </View>
            )}
          </Dialog.Content>
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
  gpsButton: {
    marginBottom: 8,
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

