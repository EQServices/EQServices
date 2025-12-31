import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, HelperText, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { colors } from '../../theme/colors';
import { LocationPicker } from '../../components/LocationPicker';
import { LocationSelection, formatLocationSelection } from '../../services/locations';

export const ManageRegionsScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState<string[]>([]);
  const [selection, setSelection] = useState<LocationSelection>({});
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRegions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('professionals')
          .select('regions')
          .eq('id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        const storedRegions: string[] = Array.isArray(data?.regions) ? data?.regions : [];
        setRegions(storedRegions);
        setError(null);
      } catch (err: any) {
        console.error('Erro ao carregar regiões de atendimento:', err);
        setError(err.message || t('manageRegions.loadingError'));
      } finally {
        setLoading(false);
      }
    };

    loadRegions();
  }, [user?.id, t]);

  const handleAddRegion = () => {
    const label = formatLocationSelection(selection);

    if (!selection.districtId) {
      setSelectionError(t('manageRegions.selectDistrict'));
      return;
    }

    if (!label) {
      setSelectionError(t('manageRegions.incompleteSelection'));
      return;
    }

    if (regions.includes(label)) {
      setSelectionError(t('manageRegions.alreadyAdded'));
      return;
    }

    setRegions((prev) => [...prev, label]);
    setSelection({});
    setSelectionError(null);
  };

  const handleRemoveRegion = (region: string) => {
    setRegions((prev) => prev.filter((entry) => entry !== region));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (regions.length === 0) {
      setError(t('manageRegions.addAtLeastOne'));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSelectionError(null);

      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          regions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      alert(t('manageRegions.saveSuccess'));
      navigation.goBack();
    } catch (err: any) {
      console.error('Erro ao atualizar regiões:', err);
      setError(err.message || t('manageRegions.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={{ gap: 16 }}>
          <Text style={styles.title}>{t('manageRegions.title')}</Text>
          <Text style={styles.subtitle}>
            {t('manageRegions.subtitle')}
          </Text>

          {loading ? (
            <Text style={styles.loading}>{t('common.loading')}</Text>
          ) : (
            <>
              <LocationPicker
                value={selection}
                onChange={(value) => {
                  setSelection(value);
                  setSelectionError(null);
                }}
                error={selectionError || undefined}
                mode="district"
                caption={t('manageRegions.caption')}
              />
              <Button
                mode="outlined"
                icon="map-marker-plus"
                onPress={handleAddRegion}
                style={styles.addButton}
                textColor={colors.professional}
              >
                {t('manageRegions.add')}
              </Button>

              <View style={styles.chipGroup}>
                {regions.length === 0 ? (
                  <Text style={styles.emptyText}>{t('manageRegions.empty')}</Text>
                ) : (
                  regions.map((region) => (
                    <Chip key={region} onPress={() => handleRemoveRegion(region)} mode="outlined" style={styles.chip}>
                      {region}
                    </Chip>
                  ))
                )}
              </View>

              {error ? <HelperText type="error">{error}</HelperText> : null}
              <Button
                mode="contained"
                onPress={handleSave}
                loading={saving}
                disabled={saving}
                style={styles.saveButton}
                buttonColor={colors.professional}
              >
                {t('manageRegions.save')}
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loading: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addButton: {
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderColor: colors.professional,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  saveButton: {
    borderRadius: 12,
  },
});

export default ManageRegionsScreen;

