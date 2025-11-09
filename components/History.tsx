import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Session } from '../types';

interface HistoryProps {
  sessions: Session[];
}

const SessionCard: React.FC<{ session: Session }> = ({ session }) => {
  const sessionDate = new Date(session.date);
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardDate}>
          {sessionDate.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <Text style={styles.cardMeta}>{session.duration} min</Text>
      </View>
      <View style={styles.cardStats}>
        <Text style={styles.cardScore}>{session.focusPercentage.toFixed(0)}%</Text>
        <Text style={styles.cardMeta}>focused</Text>
      </View>
    </View>
  );
};

export const History: React.FC<HistoryProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No history yet</Text>
        <Text style={styles.emptySubtitle}>Finish your first session to start tracking progress.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sessions}
      keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <SessionCard session={item} />}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    marginVertical: 6,
  },
  cardDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  cardStats: {
    alignItems: 'flex-end',
  },
  cardScore: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
