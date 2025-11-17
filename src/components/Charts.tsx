import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, ProgressBar, Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface MetricBarProps {
  title: string;
  current: number;
  total: number;
  description?: string;
}

export const MetricBar: React.FC<MetricBarProps> = ({ title, current, total, description }) => {
  const progress = total > 0 ? Math.min(1, current / total) : 0;

  return (
    <Card style={styles.metricCard}>
      <Card.Content style={styles.metricContent}>
        <View style={styles.row}>
          <Text style={styles.metricTitle}>{title}</Text>
          <Text style={styles.metricValue}>
            {current}
            {total > 0 ? ` / ${total}` : ''}
          </Text>
        </View>
        {description ? <Text style={styles.metricDescription}>{description}</Text> : null}
        <ProgressBar progress={progress} color={colors.primary} style={styles.progress} />
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  metricCard: {
    borderRadius: 12,
    elevation: 1,
  },
  metricContent: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  metricDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progress: {
    height: 8,
    borderRadius: 4,
  },
});

export default MetricBar;

