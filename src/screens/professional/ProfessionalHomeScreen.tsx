import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Platform, Alert } from 'react-native';
import { Text, Card, Chip, Button, Avatar, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { Lead, Professional } from '../../types';
import { supabase } from '../../config/supabase';
import { AppLogo } from '../../components/AppLogo';
import { SkeletonCardList } from '../../components/SkeletonCard';
import { withCache, CacheStrategy, removeCache } from '../../services/offlineCache';
import { useRequireUserType } from '../../hooks/useRequireUserType';

const CONFIRM_LOGOUT_MESSAGE =
  'Tem a certeza de que pretende terminar sessão? Poderá voltar a entrar quando quiser.';

export const ProfessionalHomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { user, isValid } = useRequireUserType('professional');
  const { signOut } = useAuth();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [unlockedLeads, setUnlockedLeads] = useState<Array<{ id: string; leadId: string; category?: string; location?: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUnlocked, setLoadingUnlocked] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
        avatarUrl: professionalRow?.avatar_url ?? userRow.avatar_url ?? undefined,
        categories: professionalRow?.categories || [],
        regions: professionalRow?.regions || [],
        credits: professionalRow?.credits ?? 0,
        rating: Number(professionalRow?.rating ?? 0),
        reviewCount: professionalRow?.review_count ?? 0,
        portfolio: professionalRow?.portfolio ?? undefined,
        description: professionalRow?.description ?? undefined,
      };

      setProfessional(combined);
    } catch (error) {
      console.error('Erro ao carregar dados do profissional:', error);
    }
  }, [user?.id]);

  const loadLeads = useCallback(async () => {
    if (!professional || !user?.id) return;

    try {
      setLoading(true);

      // Se o profissional não tem categorias configuradas, não mostrar leads
      if (!professional.categories || professional.categories.length === 0) {
        setLeads([]);
        return;
      }

      const cacheKey = `professional_leads_${user.id}_${professional.categories.join(',')}_${professional.regions.join(',')}`;

      const cachedLeads = await withCache<Lead[]>(
        cacheKey,
        async () => {
          // Construir query base filtrando por categoria
          // Nota: Usamos .in() que faz match exato, então a categoria do lead deve corresponder exatamente
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .in('category', professional.categories || [])
            .order('created_at', { ascending: false })
            .limit(50); // Buscar mais para filtrar por região depois no cliente

          if (error) throw error;

          // Debug: log das categorias e leads encontrados
          console.log('[DEBUG Leads] Categorias do profissional:', professional.categories);
          console.log('[DEBUG Leads] Regiões do profissional:', professional.regions);
          console.log('[DEBUG Leads] Leads encontrados (antes do filtro de região):', data?.length || 0);
          if (data && data.length > 0) {
            console.log('[DEBUG Leads] Categorias dos leads encontrados:', [...new Set(data.map(l => l.category))]);
            console.log('[DEBUG Leads] Localizações dos leads encontrados:', [...new Set(data.map(l => l.location))]);
          } else {
            // Se não encontrou leads, verificar todas as categorias disponíveis nos leads
            const { data: allLeads } = await supabase
              .from('leads')
              .select('category')
              .order('created_at', { ascending: false })
              .limit(100);
            if (allLeads && allLeads.length > 0) {
              const allCategories = [...new Set(allLeads.map(l => l.category))];
              console.log('[DEBUG Leads] Todas as categorias disponíveis nos leads:', allCategories);
              console.log('[DEBUG Leads] Categorias do profissional que não correspondem:', 
                professional.categories.filter(cat => !allCategories.includes(cat)));
            }
          }

          // Filtrar leads já desbloqueados
          const { data: unlockedLeads } = await supabase
            .from('unlocked_leads')
            .select('lead_id')
            .eq('professional_id', user.id);

          const unlockedLeadIds = new Set(
            (unlockedLeads || []).map((ul) => ul.lead_id)
          );

          // Filtrar por região (distrito) se configurado
          let filteredData = (data || []).filter((lead) => {
            // Excluir leads já desbloqueados
            if (unlockedLeadIds.has(lead.id)) {
              return false;
            }

            // Se não há regiões (distritos) configuradas, mostrar todos os leads da categoria
            if (!professional.regions || professional.regions.length === 0) {
              return true;
            }

            // Extrair o distrito da localização do lead
            // A localização está no formato "Corroios, Seixal, Setúbal" (freguesia, concelho, distrito)
            // Ou pode estar em outros formatos, então pegamos o último elemento após vírgula
            const leadLocation = (lead.location || '').trim();
            const locationParts = leadLocation.split(',').map((part: string) => part.trim());
            
            // O distrito geralmente é o último elemento
            // Mas pode haver variações, então verificamos se algum dos elementos corresponde
            const leadDistrict = locationParts.length > 0 ? locationParts[locationParts.length - 1] : leadLocation;
            
            // Comparar com os distritos do profissional (case-insensitive)
            const matchesDistrict = professional.regions.some((professionalDistrict) => {
              const professionalDistrictLower = professionalDistrict.toLowerCase().trim();
              const leadDistrictLower = leadDistrict.toLowerCase();
              
              // Verificar correspondência exata ou se o distrito do profissional está contido na localização
              return leadDistrictLower === professionalDistrictLower || 
                     leadLocation.toLowerCase().includes(professionalDistrictLower);
            });

            if (!matchesDistrict) {
              console.log(`[DEBUG Leads] Lead ${lead.id} filtrado por distrito. Lead: "${lead.location}" (distrito extraído: "${leadDistrict}"), Profissional distritos: ${professional.regions.join(', ')}`);
            }

            return matchesDistrict;
          });

          // Agrupar por service_request_id para evitar duplicatas quando um pedido tem múltiplas categorias
          const leadsByRequestId = new Map<string, any>();
          filteredData.forEach((lead) => {
            const requestId = lead.service_request_id;
            // Se já existe um lead para este pedido, manter apenas o primeiro (ou o mais recente)
            if (!leadsByRequestId.has(requestId)) {
              leadsByRequestId.set(requestId, lead);
            }
          });

          // Converter de volta para array e ordenar por data de criação (mais recente primeiro)
          const uniqueLeads = Array.from(leadsByRequestId.values())
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

          // Limitar a 20 resultados finais
          const finalLeads = uniqueLeads.slice(0, 20);

          return finalLeads.map(mapLead);
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
  }, [mapLead, professional, user?.id]);

  // Carregar dados do profissional apenas quando user.id mudar
  useEffect(() => {
    if (user?.id) {
      loadProfessionalData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Carregar leads quando professional for carregado ou suas categorias/regiões mudarem
  useEffect(() => {
    if (professional && user?.id) {
      loadLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professional?.id, professional?.categories?.join(','), professional?.regions?.join(','), user?.id]);

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

      // Limpar cache de leads para forçar recarregamento
      if (user?.id && professional) {
        const cacheKey = `professional_leads_${user.id}_${professional.categories.join(',')}_${professional.regions.join(',')}`;
        await removeCache(cacheKey);
      }

      alert('Lead desbloqueado com sucesso!');
      navigation.navigate('LeadDetail', { leadId: lead.id });
      loadProfessionalData();
      loadLeads(); // Recarregar lista de leads para remover o desbloqueado
      loadUnlockedLeads(); // Recarregar lista de leads desbloqueadas
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
          <View style={styles.headerRightButtons}>
            <View style={styles.notificationButtonContainer}>
              <IconButton
                icon="bell"
                iconColor={colors.textLight}
                size={24}
                onPress={() => navigation.navigate('Notifications')}
                style={styles.notificationButton}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </View>
            <IconButton
              icon="logout"
              iconColor={colors.textLight}
              size={24}
              onPress={handleLogout}
              style={styles.logoutButton}
            />
          </View>
        </View>
        <View style={styles.headerTop}>
          {professional?.avatarUrl ? (
            <Avatar.Image size={64} source={{ uri: professional.avatarUrl }} />
          ) : (
            <Avatar.Icon size={64} icon="account" />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeText}>{t('common.hello')}, {user?.name}!</Text>
            <Text style={styles.creditsSummary}>{t('professional.home.currentBalance', { credits: professional?.credits || 0 })}</Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('ProfessionalDashboard')}
            style={styles.headerButton}
            textColor={colors.textLight}
          >
            {t('professional.home.viewDashboard')}
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
            {t('professional.home.buyCredits')}
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
        {unlockedLeads.length > 0 && (
          <View style={styles.unlockedSection}>
            <Text style={styles.sectionTitle}>Minhas Leads Desbloqueadas</Text>
            <View style={styles.unlockedList}>
              {unlockedLeads.map((unlocked) => (
                <Card
                  key={unlocked.id}
                  style={styles.unlockedCard}
                  onPress={() => navigation.navigate('LeadDetail', { leadId: unlocked.leadId })}
                >
                  <Card.Content style={styles.unlockedCardContent}>
                    <View style={styles.unlockedCardHeader}>
                      <Chip style={styles.unlockedCategoryChip}>{unlocked.category || 'Serviço'}</Chip>
                      <Text style={styles.unlockedLocation}>📍 {unlocked.location || 'Localização não especificada'}</Text>
                    </View>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('LeadDetail', { leadId: unlocked.leadId })}
                      style={styles.viewButton}
                      textColor={colors.professional}
                    >
                      Ver detalhes e enviar proposta
                    </Button>
                  </Card.Content>
                </Card>
              ))}
            </View>
          </View>
        )}
        <Text style={styles.sectionTitle}>Oportunidades Disponíveis</Text>
        {loading ? (
          <SkeletonCardList />
        ) : leads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Avatar.Icon size={72} icon="briefcase-search" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>
              {!professional?.categories || professional.categories.length === 0
                ? 'Configure suas categorias primeiro'
                : 'Nenhum lead disponível agora'}
            </Text>
            <Text style={styles.emptySubtext}>
              {!professional?.categories || professional.categories.length === 0
                ? 'Para ver oportunidades, configure as categorias de serviços que oferece em "Gerir perfil".'
                : 'Atualize a página mais tarde ou ajuste as suas regiões e categorias para receber mais oportunidades.'}
            </Text>
            {(!professional?.categories || professional.categories.length === 0) ? (
              <Button
                mode="contained"
                icon="account-cog"
                onPress={() => navigation.navigate('ManageProfile')}
                buttonColor={colors.professional}
                style={{ marginTop: 12 }}
              >
                Configurar categorias
              </Button>
            ) : (
              <Button mode="outlined" icon="refresh" onPress={loadLeads} textColor={colors.professional}>
                Atualizar oportunidades
              </Button>
            )}
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
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationButtonContainer: {
    position: 'relative',
  },
  notificationButton: {
    margin: 0,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    zIndex: 1,
  },
  badgeText: {
    color: colors.textLight,
    fontSize: 10,
    fontWeight: 'bold',
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
  unlockedSection: {
    marginBottom: 24,
  },
  unlockedList: {
    gap: 12,
  },
  unlockedCard: {
    marginBottom: 12,
    elevation: 2,
  },
  unlockedCardContent: {
    padding: 12,
  },
  unlockedCardHeader: {
    marginBottom: 12,
  },
  unlockedCategoryChip: {
    backgroundColor: colors.primary,
    marginBottom: 8,
  },
  unlockedLocation: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  viewButton: {
    marginTop: 8,
    borderColor: colors.professional,
  },
});

