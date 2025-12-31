import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { RouteProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { RatingStars } from '../../components/RatingStars';
import { submitReview } from '../../services/reviews';

interface ReviewScreenRouteParams {
  serviceRequestId: string;
  professionalId: string;
  professionalName?: string;
}

interface ReviewScreenProps {
  navigation: any;
  route: RouteProp<{ params: ReviewScreenRouteParams }, 'params'>;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user?.id) {
      setError(t('review.invalidSession'));
      return;
    }

    if (rating === 0) {
      setError(t('review.selectRatingError'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await submitReview({
        serviceRequestId: route.params.serviceRequestId,
        professionalId: route.params.professionalId,
        clientId: user.id,
        rating,
        comment,
      });

      navigation.navigate({
        name: 'ServiceRequestDetail',
        params: { requestId: route.params.serviceRequestId, reviewUpdated: Date.now() },
        merge: true,
      });
    } catch (err: any) {
      setError(err.message || t('review.submitError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.title}>{t('review.title')}</Text>
          <Text style={styles.subtitle}>
            {t('review.subtitle')}{' '}
            <Text style={styles.highlight}>{route.params.professionalName || t('review.professional')}</Text>
            {t('review.subtitleEnd')}
          </Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>{t('review.serviceQuality')}</Text>
            <RatingStars rating={rating} readOnly={false} onChange={setRating} size={36} />
            <Text style={styles.helperText}>
              {rating > 0 ? t('review.ratingOf', { rating }) : t('review.selectRating')}
            </Text>
          </View>

          <TextInput
            mode="outlined"
            label={t('review.comment')}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={5}
            placeholder={t('review.commentPlaceholder')}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor={colors.primary}
          >
            {t('review.submit')}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
  },
  cardContent: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  highlight: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  ratingContainer: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.background,
  },
  button: {
    borderRadius: 12,
    marginTop: 8,
  },
  error: {
    color: colors.error,
    fontSize: 14,
  },
});

export default ReviewScreen;

