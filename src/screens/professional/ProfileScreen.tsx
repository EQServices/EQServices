import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, Chip, List, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { RatingStars } from '../../components/RatingStars';
import { listProfessionalReviews, getProfessionalReviewSummary } from '../../services/reviews';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';

interface ProfileScreenRouteParams {
  professionalId?: string;
  professionalName?: string;
}

interface ProfileScreenProps {
  route: RouteProp<{ params: ProfileScreenRouteParams }, 'params'>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ route }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Se professionalId não for fornecido, usar o ID do usuário logado apenas se ele for profissional
  // Caso contrário, não carregar nada (para evitar mostrar perfil errado)
  const professionalId = route.params?.professionalId || (user?.userType === 'professional' ? user?.id : undefined);
  

  
  // Debug: Log para verificar qual ID está sendo usado
  useEffect(() => {
    console.log('[DEBUG Profile] route.params:', route.params);
    console.log('[DEBUG Profile] professionalId from route:', route.params?.professionalId);
    console.log('[DEBUG Profile] user?.id:', user?.id);
    console.log('[DEBUG Profile] user?.userType:', user?.userType);
    console.log('[DEBUG Profile] final professionalId:', professionalId);
  }, [professionalId, route.params, user?.id, user?.userType]);
  
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [credits, setCredits] = useState<number>(0);
  const [portfolio, setPortfolio] = useState<string[]>([]);
  const [professionalName, setProfessionalName] = useState<string | null>(null);
  const [reviews, setReviews] = useState<
    Array<{
      id: string;
      rating: number;
      comment?: string | null;
      createdAt: string;
      clientName?: string;
    }>
  >([]);

  useEffect(() => {
    const load = async () => {
      if (!professionalId) {
        console.warn('[DEBUG Profile] professionalId não fornecido, não carregando perfil');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        console.log('[DEBUG Profile] Carregando perfil do profissional:', professionalId);
        const [
          { data: userData, error: userError },
          { data: professionalData, error: professionalError },
          summaryResult,
          reviewResult,
        ] = await Promise.all([
          supabase
            .from('users')
            .select('name')
            .eq('id', professionalId)
            .maybeSingle(),
          supabase
            .from('professionals')
            .select('avatar_url, description, categories, regions, credits, portfolio')
            .eq('id', professionalId)
            .maybeSingle(),
          getProfessionalReviewSummary(professionalId),
          listProfessionalReviews(professionalId),
        ]);

        // Log detalhado dos dados recebidos
        console.log('[DEBUG Profile] userData:', userData);
        console.log('[DEBUG Profile] userError:', userError);
        console.log('[DEBUG Profile] professionalData:', professionalData);
        console.log('[DEBUG Profile] professionalError:', professionalError);

        if (userError) {
          console.error('[DEBUG Profile] Erro ao buscar userData:', userError);
          // Não lançar erro, apenas logar - pode ser problema de RLS
        }
        if (professionalError) {
          console.error('[DEBUG Profile] Erro ao buscar professionalData:', professionalError);
          // Não lançar erro, apenas logar - pode ser problema de RLS
        }

        // Definir o nome do profissional
        if (userData?.name) {
          setProfessionalName(userData.name);
          console.log('[DEBUG Profile] Nome do profissional carregado da tabela users:', userData.name);
        } else if (route.params?.professionalName) {
          setProfessionalName(route.params.professionalName);
          console.log('[DEBUG Profile] Usando nome dos params:', route.params.professionalName);
        } else {
          console.warn('[DEBUG Profile] Nome do profissional não encontrado nem na tabela users nem nos params');
        }

        if (professionalData) {
          console.log('[DEBUG Profile] Dados do profissional carregados:', {
            avatar_url: professionalData.avatar_url,
            description: professionalData.description,
            categories: professionalData.categories,
            regions: professionalData.regions,
            credits: professionalData.credits,
            portfolio: professionalData.portfolio,
          });
          setAvatarUrl(professionalData.avatar_url ?? null);
          setDescription(professionalData.description ?? null);
          setCategories(Array.isArray(professionalData.categories) ? professionalData.categories : []);
          setRegions(Array.isArray(professionalData.regions) ? professionalData.regions : []);
          setCredits(professionalData.credits ?? 0);
          setPortfolio(Array.isArray(professionalData.portfolio) ? professionalData.portfolio : []);
        } else {
          console.warn('[DEBUG Profile] Dados do profissional não encontrados na tabela professionals');
        }

        setSummary(summaryResult);
        setReviews(
          reviewResult.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            clientName: review.client?.name,
          })),
        );
      } catch (error) {
        console.error('Erro ao carregar avaliações do profissional:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [professionalId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating color={colors.professional} />
        <Text style={styles.loaderText}>{t('profile.view.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content style={styles.summaryContent}>
          <View style={styles.headerRow}>
            {avatarUrl ? (
              <Avatar.Image size={80} source={{ uri: avatarUrl }} />
            ) : (
              <Avatar.Icon size={80} icon="account" />
            )}
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {professionalName || route.params?.professionalName || (user?.userType === 'professional' && user?.id === professionalId ? user?.name : null) || t('auth.professional')}
              </Text>
              {/* Mostrar créditos apenas se for o próprio profissional visualizando seu perfil */}
              {user?.userType === 'professional' && user?.id === professionalId && (
                <Text style={styles.creditsLabel}>{t('profile.view.credits')}: {credits}</Text>
              )}
            </View>
          </View>
          <View style={styles.ratingRow}>
            <RatingStars rating={summary.average} size={30} />
            <Text style={styles.averageText}>{summary.average.toFixed(1)} / 5</Text>
          </View>
          <Text style={styles.totalReviews}>
            {summary.count === 1 
              ? t('profile.view.totalReviews', { count: summary.count })
              : t('profile.view.totalReviewsPlural', { count: summary.count })}
          </Text>
          {description ? <Text style={styles.description}>{description}</Text> : <Text style={styles.description}>{t('profile.view.noDescription')}</Text>}
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content style={{ gap: 12 }}>
          <Text style={styles.sectionTitle}>{t('profile.view.categories')}</Text>
          <View style={styles.chipGroup}>
            {categories.length === 0 ? (
              <Text style={styles.emptyText}>{t('profile.view.noCategories')}</Text>
            ) : (
              categories.map((category) => (
                <Chip key={category} mode="outlined" style={styles.infoChip}>
                  {category}
                </Chip>
              ))
            )}
          </View>

          <Text style={styles.sectionTitle}>{t('profile.view.regions')}</Text>
          <View style={styles.chipGroup}>
            {regions.length === 0 ? (
              <Text style={styles.emptyText}>{t('profile.view.noRegions')}</Text>
            ) : (
              regions.map((region) => (
                <Chip key={region} mode="outlined" style={styles.infoChip}>
                  {region}
                </Chip>
              ))
            )}
          </View>
        </Card.Content>
      </Card>

      {portfolio.length > 0 ? (
        <Card style={styles.infoCard}>
          <Card.Content style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>{t('profile.view.portfolio')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.portfolioRow}>
              {portfolio.map((item) => (
                <Avatar.Image
                  key={item}
                  size={72}
                  source={{ uri: item }}
                  style={styles.portfolioImage}
                />
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      ) : null}

      <Card style={styles.reviewsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>{t('profile.view.reviews')}</Text>
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>{t('profile.view.noReviews')}</Text>
          ) : (
            reviews.map((review) => (
              <List.Item
                key={review.id}
                title={() => (
                  <View style={styles.reviewHeader}>
                    <RatingStars rating={review.rating} size={22} />
                    <Text style={styles.reviewClient}>{review.clientName || t('auth.client')}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                description={review.comment || t('profile.view.noDescription')}
                descriptionNumberOfLines={4}
              />
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.background,
    gap: 16,
  },
  summaryCard: {
    borderRadius: 16,
    elevation: 2,
  },
  summaryContent: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  creditsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  averageText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.professional,
  },
  totalReviews: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.text,
  },
  infoCard: {
    borderRadius: 16,
    elevation: 1,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoChip: {
    borderColor: colors.border,
  },
  reviewsCard: {
    borderRadius: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewClient: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 'auto',
  },
  portfolioRow: {
    gap: 12,
  },
  portfolioImage: {
    backgroundColor: colors.surfaceLight,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 12,
  },
  loaderText: {
    color: colors.textSecondary,
  },
});

export default ProfileScreen;

