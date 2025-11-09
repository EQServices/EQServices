import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, List, Text } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { RatingStars } from '../../components/RatingStars';
import { listProfessionalReviews, getProfessionalReviewSummary } from '../../services/reviews';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileScreenRouteParams {
  professionalId?: string;
  professionalName?: string;
}

interface ProfileScreenProps {
  route: RouteProp<{ params: ProfileScreenRouteParams }, 'params'>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ route }) => {
  const { user } = useAuth();
  const professionalId = route.params?.professionalId ?? user?.id;
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
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
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [summaryResult, reviewResult] = await Promise.all([
          getProfessionalReviewSummary(professionalId),
          listProfessionalReviews(professionalId),
        ]);

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
        <Text style={styles.loaderText}>A carregar avaliações...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content style={styles.summaryContent}>
          <Text style={styles.title}>{route.params?.professionalName || user?.name || 'Profissional'}</Text>
          <View style={styles.ratingRow}>
            <RatingStars rating={summary.average} size={30} />
            <Text style={styles.averageText}>{summary.average.toFixed(1)} / 5</Text>
          </View>
          <Text style={styles.totalReviews}>{summary.count} avaliações registradas</Text>
        </Card.Content>
      </Card>

      <Card style={styles.reviewsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Avaliações recentes</Text>
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>Ainda não existem avaliações para este profissional.</Text>
          ) : (
            reviews.map((review) => (
              <List.Item
                key={review.id}
                title={() => (
                  <View style={styles.reviewHeader}>
                    <RatingStars rating={review.rating} size={22} />
                    <Text style={styles.reviewClient}>{review.clientName || 'Cliente'}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('pt-PT', { dateStyle: 'medium' })}
                    </Text>
                  </View>
                )}
                description={review.comment || 'Sem comentários adicionais.'}
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
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

