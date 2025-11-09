import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RefreshIcon } from './icons';
import type { SessionSummaryData } from '../types';

interface SessionSummaryProps {
  summaryData: SessionSummaryData;
  onReset: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({ summaryData, onReset }) => {
  const { summary, tip, frames } = summaryData;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Session complete</Text>
      <Text style={styles.summary}>{summary}</Text>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Pro Tip</Text>
        <Text style={styles.tipBody}>{tip}</Text>
      </View>

      {frames.length > 0 && (
        <View style={styles.framesSection}>
          <Text style={styles.framesTitle}>Focus Highlights</Text>
          <View style={styles.framesGrid}>
            {frames.map((frame, index) => (
              <Image
                key={index}
                source={{ uri: frame }}
                style={styles.frameImage}
                resizeMode="cover"
              />
            ))}
          </View>
        </View>
      )}

      <Pressable
        onPress={onReset}
        accessibilityRole="button"
        style={({ pressed }) => [styles.buttonWrapper, pressed && { opacity: 0.85 }]}
      >
        <LinearGradient colors={['#4F46E5', '#EC4899']} style={styles.button}>
          <RefreshIcon size={18} color="#F9FAFB" />
          <Text style={styles.buttonText}>Back to dashboard</Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    paddingBottom: 32,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F9FAFB',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 12,
  },
  summary: {
    fontSize: 16,
    lineHeight: 22,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 20,
  },
  tipCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    marginBottom: 24,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A5B4FC',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tipBody: {
    fontSize: 15,
    lineHeight: 21,
    color: '#F1F5F9',
  },
  framesSection: {
    marginBottom: 24,
  },
  framesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 12,
  },
  framesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  frameImage: {
    width: 88,
    height: 88,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    margin: 6,
  },
  buttonWrapper: {
    alignSelf: 'center',
    borderRadius: 999,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
    gap: 10,
  },
  buttonText: {
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
});
