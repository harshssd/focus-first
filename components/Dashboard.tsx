import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChartBarIcon, PlayIcon } from './icons';
import { ProgressChart } from './ProgressChart';
import type { Session } from '../types';

interface DashboardProps {
  onStartSession: () => void;
  sessionHistory: Session[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartSession, sessionHistory }) => {
  const lastSession = sessionHistory[0];

    return (
      <View style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Center your attention and let us watch the rest.</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onStartSession}
        style={({ pressed }) => [styles.startButtonWrapper, pressed && styles.startButtonPressed]}
      >
        <LinearGradient colors={['#4F46E5', '#EC4899']} style={styles.startButton}>
          <View style={styles.startButtonIcon}>
            <PlayIcon size={20} color="#F9FAFB" />
          </View>
          <Text style={styles.startButtonText}>Start New Session</Text>
        </LinearGradient>
      </Pressable>

        <View style={styles.grid}>
          <View style={[styles.card, styles.cardSpacing]}>
          <View style={styles.cardHeader}>
            <ChartBarIcon size={18} color="#A5B4FC" />
            <Text style={styles.cardTitle}>Focus Trend</Text>
          </View>
          <ProgressChart sessions={sessionHistory} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Last Session</Text>
          {lastSession ? (
              <View style={styles.cardBody}>
                <Text style={[styles.cardLabel, styles.cardLabelSpacing]}>
                {new Date(lastSession.date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
                <Text style={[styles.focusScore, styles.focusScoreSpacing]}>
                {lastSession.focusPercentage.toFixed(0)}%
                <Text style={styles.focusScoreSuffix}> focused</Text>
              </Text>
              <Text style={styles.cardLabel}>for {lastSession.duration} min</Text>
              <Text style={styles.tipTitle}>Takeaway</Text>
              <Text style={styles.tipText}>{lastSession.tip}</Text>
            </View>
          ) : (
            <Text style={styles.emptyState}>
              Your focus history will appear here once you complete a session.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 4,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F9FAFB',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#CBD5F5',
    lineHeight: 20,
  },
  startButtonWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginBottom: 28,
  },
  startButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
  },
  startButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  startButtonText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  grid: {
    flexDirection: 'column',
  },
  cardSpacing: {
    marginBottom: 18,
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  cardLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  cardLabelSpacing: {
    marginBottom: 8,
  },
  cardBody: {
    marginTop: 12,
  },
  focusScore: {
    fontSize: 36,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  focusScoreSpacing: {
    marginBottom: 6,
  },
  focusScoreSuffix: {
    fontSize: 16,
    fontWeight: '500',
    color: '#CBD5F5',
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#A5B4FC',
    marginTop: 18,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 15,
    color: '#E5E7EB',
    lineHeight: 21,
  },
  emptyState: {
    fontSize: 14,
    lineHeight: 20,
    color: '#94A3B8',
  },
});
