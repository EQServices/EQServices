import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform, Alert } from 'react-native';
import { Text, Card, Chip, Button, Avatar, IconButton } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { Lead, Professional } from '../../types';
import { supabase } from '../../config/supabase';
import { AppLogo } from '../../components/AppLogo';
import { SkeletonCardList } from '../../components/SkeletonCard';
import { withCache, CacheStrategy } from '../../services/offlineCache';
import { useRequireUserType } from '../../hooks/useRequireUserType';

const CONFIRM_LOGOUT_MESSAGE =
  'Tem a certeza de que pretende terminar sessão? Poderá voltar a entrar quando quiser.';

export const ProfessionalHomeScreen = ({ navigation }: any) => {
  const { user, isValid } = useRequireUserType('professional');
  const { signOut } = useAuth();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // Na web, usar confirm do navegador
      const confirmed = (globalThis as any).window?.confirm(CONFIRM_LOGOUT_MESSAGE);
      if (!confirmed) return;
      await performLogout();
    } else {
      // No mobile, usar Alert
      Alert.alert('Terminar sessão', CONFIRM_LOGOUT_MESSAGE, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Terminar sessão',
          style: 'destructive',
          onPress: async () => {
            await performLogout();
          },
        },
      ]);
    }
  };

  const performLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Erro ao terminar sessão:', err);
      const errorMessage = 'Não foi possível terminar a sessão. Tente novamente.';
      if (Platform.OS === 'web') {
        (globalThis as any).window?.alert(errorMessage);
      } else {
        Alert.alert('Erro', errorMessage);
      }
    }
  };

  const mapLead = useCallback((row: any): Lead => {
    return {
      id: row.id,
      serviceRequestId: row.service_request_id,
      category: row.category,
      cost: row.cost,
      location: row.location,
      description: row.description,
      createdAt: row.created_at,
    };
  }, []);

  const loadProfessionalData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [{ data: userRow, error: userError }, { data: professionalRow, error: professionalError }] =
        await Promise.all([
          supabase.from('users').select('*').eq('id', user.id).single(),
          supabase.from('professionals').select('*').eq('id', user.id).single(),
        ]);

      if (userError) throw userError;
      if (professionalError && professionalError.code !== 'PGRST116') {
        // PGRST116 = Row not found; tratamos mais abaixo
        throw professionalError;
      }

      if (!userRow) {
        setProfessional(null);
        return;
      }

      const combined: Professional = {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name,
        phone: userRow.phone ?? undefined,
        userType: userRow.user_type || 'professional',
        createdAt: userRow.created_at,
        avatarUrl: userRow.avatar_url ?? undefined,
        categories: professionalRow?.categories || [],
        regions: professionalRow?.regions || [],
        credits: professionalRow?.credits ?? 0,
        rating: Number(professionalRow?.rating ?? 0),
        reviewCount: professionalRow?.review_count ?? 0,
        portfolio: professionalRow?.portfolio ?? undefined,
        description: professionalRow?.description ?? undefined,
        avatarUrl: professionalRow?.avatar_url ?? null,
      };

      setProfessional(combined);
    } catch (error) {
      console.error('Erro ao carregar dados do profissional:', error);
    }
  }, [user?.id]);

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);

      const cachedLeads = await withCache<Lead[]>(
        'professional_leads',
        async () => {
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

          if (error) throw error;
          return (data || []).map(mapLead);
        },
        CacheStrategy.NETWORK_FIRST,
        2 * 60 * 1000, // Cache por 2 minutos
      );

      setLeads(cachedLeads);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  }, [mapLead]);

  useEffect(() => {
    loadProfessionalData();
    loadLeads();
  }, [loadLeads, loadProfessionalData]);

  // Se não for profissional válido, não renderizar conteúdo
  if (!isValid) {
    return null;
  }

  const handleUnlockLead = async (lead: Lead) => {
    if (!professional || professional.credits < lead.cost) {
      alert('Créditos insuficientes. Compre mais créditos para desbloquear este lead.');
      navigation.navigate('BuyCredits');
      return;
    }

    try {
      // Desbloquear lead e debitar créditos
      const { error } = await supabase.rpc('unlock_lead', {
        lead_id: lead.id,
        professional_id: user?.id,
        cost: lead.cost,
      });

      if (error) throw error;

      alert('Lead desbloqueado com sucesso!');
      navigation.navigate('LeadDetail', { leadId: lead.id });
      loadProfessionalData();
    } catch (error: any) {
      alert(error.message || 'Erro ao desbloquear lead');
    }
  };

  const renderLead = ({ item }: { item: Lead }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Chip style={styles.categoryChip}>{item.category}</Chip>
          <Chip
            icon="coin"
            style={styles.costChip}
            textStyle={{ color: colors.textLight, fontWeight: 'bold' }}
          >
            {item.cost} moedas
          </Chip>
        </View>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
        <Text style={styles.location}>📍 {item.location}</Text>
        <Button
          mode="contained"
          onPress={() => handleUnlockLead(item)}
          style={styles.unlockButton}
          buttonColor={colors.secondary}
        >
          Desbloquear Lead
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopBar}>
          <View style={styles.logoWrapper}>
            <AppLogo size={150} withBackground />
          </View>
          <IconButton
            icon="logout"
            iconColor={colors.textLight}
            size={24}
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
        <View style={styles.headerTop}>
          {professional?.avatarUrl ? (
            <Avatar.Image size={64} source={{ uri: professional.avatarUrl }} />
          ) : (
            <Avatar.Icon size={64} icon="account" />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeText}>Olá, {user?.name}!</Text>
            <Text style={styles.creditsSummary}>Saldo atual: {professional?.credits || 0} moedas</Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('ProfessionalDashboard')}
            style={styles.headerButton}
            textColor={colors.textLight}
          >
            Ver dashboard
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Help')}
            style={styles.headerButton}
            textColor={colors.textLight}
            icon="help-circle"
          >
            Ajuda
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('BuyCredits')}
            style={styles.headerButton}
            textColor={colors.textLight}
          >
            Comprar créditos
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.headerButton}
            textColor={colors.textLight}
          >
            Editar dados pessoais
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ManageProfile')}
            style={styles.manageButton}
            buttonColor={colors.textLight}
            textColor={colors.professional}
          >
            Gerir perfil
          </Button>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Oportunidades Disponíveis</Text>
        {loading ? (
          <SkeletonCardList />
        ) : leads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Avatar.Icon size={72} icon="briefcase-search" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>Nenhum lead disponível agora</Text>
            <Text style={styles.emptySubtext}>
              Atualize a página mais tarde ou ajuste as suas regiões e categorias para receber mais
              oportunidades.
            </Text>
            <Button mode="outlined" icon="refresh" onPress={loadLeads} textColor={colors.professional}>
              Atualizar oportunidades
            </Button>
          </View>
        ) : (
          <FlatList
            data={leads}
            renderItem={renderLead}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={loadLeads}
                tintColor={colors.professional}
              />
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.professional,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logoWrapper: {
    alignItems: 'flex-start',
    flex: 1,
    maxWidth: '100%',
  },
  logoTagline: {
    color: colors.textLight,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.4,
  },
  logoutButton: {
    margin: 0,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  creditsSummary: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerButton: {
    borderColor: colors.textLight,
  },
  manageButton: {
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: colors.primary,
  },
  costChip: {
    backgroundColor: colors.secondary,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  unlockButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIcon: {
    backgroundColor: colors.primary,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
});

