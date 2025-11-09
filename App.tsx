import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  analyzePosture,
  generateVoiceFeedback,
  summarizeSession,
} from './services/geminiService';
import { playAudio } from './utils/audio';
import { Dashboard } from './components/Dashboard';
import { CameraFeed, type CameraFeedHandle } from './components/CameraFeed';
import { SessionSummary } from './components/SessionSummary';
import { History } from './components/History';
import { BottomNav } from './components/BottomNav';
import { LogoIcon } from './components/icons';
import { useSessionHistory } from './hooks/useSessionHistory';
import type { AppView, FocusLogEntry, FocusStatus, SessionSummaryData } from './types';

const ANALYSIS_INTERVAL = 8000;
const DISTRACTION_FEEDBACK = [
  "Let's step back into focus. You've got this.",
  'Deep breath. Bring your attention back to the task.',
  "Your goals are waiting - let's lean back in.",
  'Friendly reminder: refocus and keep your momentum.',
];

const viewTitles: Record<AppView, string> = {
  DASHBOARD: 'Dashboard',
  SESSION: 'Focus Session',
  SUMMARY: 'Session Summary',
  HISTORY: 'Session History',
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [focusStatus, setFocusStatus] = useState<FocusStatus>('IDLE');
  const [focusLog, setFocusLog] = useState<FocusLogEntry[]>([]);
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const cameraRef = useRef<CameraFeedHandle | null>(null);
  const analysisIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const isSessionActiveRef = useRef(false);

  const { sessionHistory, addSessionToHistory } = useSessionHistory();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  const runAnalysis = useCallback(async () => {
    if (!isSessionActiveRef.current || !cameraRef.current) {
      return;
    }

    const frame = await cameraRef.current.captureFrame();
    if (!frame) {
      return;
    }

    try {
      const newStatus = await analyzePosture(frame);
      setFocusStatus(previous => {
        if (
          (newStatus === 'DISTRACTED' || newStatus === 'AWAY') &&
          newStatus !== previous
        ) {
          const feedback =
            DISTRACTION_FEEDBACK[Math.floor(Math.random() * DISTRACTION_FEEDBACK.length)];
          generateVoiceFeedback(feedback)
            .then(audioBase64 => playAudio(audioBase64))
            .catch(err => {
              if (__DEV__) {
                console.warn('Voice feedback failed', err);
              }
            });
        }
        return newStatus;
      });

      setFocusLog(prevLog => [
        ...prevLog,
        {
          timestamp: new Date().toISOString(),
          status: newStatus,
          frame: newStatus === 'FOCUSED' ? frame : undefined,
        },
      ]);
    } catch (err) {
      console.error('Analysis failed:', err);
      if (!isMountedRef.current) return;
      setError('Focus analysis failed. Check your network or API key.');
      setIsSessionActive(false);
      setCurrentView('DASHBOARD');
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    }
  }, []);

  const handleStartSession = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setFocusLog([]);
    setSummaryData(null);
    setError(null);
    setIsSessionActive(true);
    setFocusStatus('ANALYZING');
    setCurrentView('SESSION');
    setElapsedTime(0);
    sessionStartRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    runAnalysis();
    analysisIntervalRef.current = setInterval(runAnalysis, ANALYSIS_INTERVAL);
  }, [runAnalysis]);

  const handleEndSession = useCallback(async () => {
    setIsSessionActive(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setIsLoading(true);
    setFocusStatus('IDLE');

    try {
      const { summary, tip } = await summarizeSession(focusLog);
      const focusedFrames = focusLog
        .filter(entry => entry.status === 'FOCUSED' && entry.frame)
        .slice(-5)
        .map(entry => entry.frame!)
        .filter(Boolean);

      const sessionSummary: SessionSummaryData = {
        summary,
        tip,
        frames: focusedFrames,
      };

      if (!isMountedRef.current) {
        return;
      }

      setSummaryData(sessionSummary);

      const sessionEnd = Date.now();
      const durationMinutes = sessionStartRef.current
        ? Math.round((sessionEnd - sessionStartRef.current) / (1000 * 60))
        : 0;
      const focusPercentage =
        focusLog.length > 0
          ? (focusLog.filter(entry => entry.status === 'FOCUSED').length / focusLog.length) *
            100
          : 0;

      addSessionToHistory({
        id: sessionStartRef.current || Date.now(),
        date: new Date().toISOString(),
        duration: durationMinutes,
        focusPercentage,
        ...sessionSummary,
      });

      setCurrentView('SUMMARY');
    } catch (err) {
      console.error('Summary generation failed:', err);
      if (!isMountedRef.current) {
        return;
      }
      setError('Unable to generate your session summary.');
      setCurrentView('DASHBOARD');
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [focusLog, addSessionToHistory]);

  const handleViewChange = useCallback(
    (view: AppView) => {
      if (isSessionActive && view !== 'SESSION') {
        return;
      }
      if (view === 'SESSION') {
        handleStartSession();
      } else {
        setCurrentView(view);
      }
    },
    [handleStartSession, isSessionActive],
  );

  const headerTitle = useMemo(() => viewTitles[currentView], [currentView]);

  const renderView = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A5B4FC" />
          <Text style={styles.loadingText}>Generating your focus summary...</Text>
        </View>
      );
    }

    switch (currentView) {
      case 'SESSION':
        return (
          <View style={styles.sessionContainer}>
            <CameraFeed
              ref={cameraRef}
              isSessionActive={isSessionActive}
              status={focusStatus}
              elapsedTime={elapsedTime}
            />
            <Pressable
              accessibilityRole="button"
              onPress={handleEndSession}
              style={({ pressed }) => [
                styles.endSessionButtonWrapper,
                pressed && styles.endSessionButtonPressed,
              ]}
            >
              <LinearGradient
                colors={['#F43F5E', '#F97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.endSessionButton}
              >
                <Text style={styles.endSessionLabel}>End Session</Text>
              </LinearGradient>
            </Pressable>
          </View>
        );
      case 'SUMMARY':
        return (
          summaryData && (
            <SessionSummary summaryData={summaryData} onReset={() => setCurrentView('DASHBOARD')} />
          )
        );
      case 'HISTORY':
        return <History sessions={sessionHistory} />;
      case 'DASHBOARD':
      default:
        return <Dashboard onStartSession={handleStartSession} sessionHistory={sessionHistory} />;
    }
  }, [
    currentView,
    elapsedTime,
    focusStatus,
    handleEndSession,
    handleStartSession,
    isLoading,
    isSessionActive,
    sessionHistory,
    summaryData,
  ]);

  return (
    <LinearGradient colors={['#0F172A', '#111827', '#1F2937']} style={styles.gradient}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <LogoIcon size={36} />
          <Text style={styles.headerTitle}>{headerTitle}</Text>
        </View>

        <View style={styles.content}>{renderView()}</View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        {!isSessionActive && currentView !== 'SUMMARY' && (
          <BottomNav currentView={currentView} onChange={handleViewChange} />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F9FAFB',
    marginLeft: 12,
    letterSpacing: 0.4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#CBD5F5',
    fontSize: 15,
  },
  sessionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  endSessionButtonWrapper: {
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 28,
  },
  endSessionButtonPressed: {
    opacity: 0.85,
  },
  endSessionButton: {
    borderRadius: 999,
    paddingHorizontal: 40,
    paddingVertical: 14,
    shadowColor: '#F43F5E',
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 8,
  },
  endSessionLabel: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  errorBox: {
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.4)',
    padding: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FCA5A5',
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: '#FECACA',
    lineHeight: 18,
  },
});
