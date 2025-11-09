import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { FocusStatus, FocusLogEntry, SessionSummaryData, Session } from './types';
import { CameraFeed } from './components/CameraFeed';
import { SessionSummary } from './components/SessionSummary';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { BottomNav } from './components/BottomNav';
import { analyzePosture, generateVoiceFeedback, summarizeSession } from './services/geminiService';
import { playAudio } from './utils/audio';
import { LogoIcon } from './components/icons';
import { useSessionHistory } from './hooks/useSessionHistory';

const ANALYSIS_INTERVAL = 8000; // 8 seconds
const DISTRACTION_FEEDBACK = [
  "Let's get back to it. You can do this.",
  "A small break is fine, but let's refocus now.",
  "Remember your goals. Let's stay on track.",
  "Gently bringing your attention back to your work.",
];

export type View = 'DASHBOARD' | 'SESSION' | 'SUMMARY' | 'HISTORY';

const viewTitles: Record<View, string> = {
    DASHBOARD: 'Dashboard',
    SESSION: 'Focus Session',
    SUMMARY: 'Session Summary',
    HISTORY: 'Session History',
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [focusStatus, setFocusStatus] = useState<FocusStatus>('IDLE');
  const [focusLog, setFocusLog] = useState<FocusLogEntry[]>([]);
  const [summaryData, setSummaryData] = useState<SessionSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { sessionHistory, addSessionToHistory } = useSessionHistory();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    }
    return null;
  }, []);

  const runAnalysis = useCallback(async () => {
    const frame = captureFrame();
    if (!frame) return;

    try {
      const newStatus = await analyzePosture(frame);
      setFocusStatus(prevStatus => {
        if (newStatus !== prevStatus && (newStatus === 'DISTRACTED' || newStatus === 'AWAY')) {
          const feedbackText = DISTRACTION_FEEDBACK[Math.floor(Math.random() * DISTRACTION_FEEDBACK.length)];
          generateVoiceFeedback(feedbackText).then(audioBase64 => {
            if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            playAudio(audioBase64, audioContextRef.current);
          }).catch(console.error);
        }
        return newStatus;
      });
      setFocusLog(prevLog => [...prevLog, { timestamp: new Date().toISOString(), status: newStatus, frame: newStatus === 'FOCUSED' ? frame : undefined }]);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Failed to analyze focus. Please check your API key and network connection.");
      setIsSessionActive(false);
      setCurrentView('DASHBOARD');
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    }
  }, [captureFrame]);

  const handleStartSession = useCallback(() => {
    setFocusLog([]);
    setSummaryData(null);
    setError(null);
    setIsSessionActive(true);
    setCurrentView('SESSION');
    setFocusStatus('ANALYZING');
    sessionStartRef.current = Date.now();
    setElapsedTime(0);
    
    timerIntervalRef.current = window.setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    runAnalysis();
    analysisIntervalRef.current = window.setInterval(runAnalysis, ANALYSIS_INTERVAL);
  }, [runAnalysis]);

  const handleEndSession = useCallback(async () => {
    setIsSessionActive(false);
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    analysisIntervalRef.current = null;
    timerIntervalRef.current = null;
    setIsLoading(true);
    setFocusStatus('IDLE');

    try {
        const { summary, tip } = await summarizeSession(focusLog);
        const focusedFrames = focusLog.filter(entry => entry.status === 'FOCUSED' && entry.frame).slice(-5).map(entry => entry.frame!);
        const newSummaryData = { summary, tip, frames: focusedFrames };
        setSummaryData(newSummaryData);

        const sessionEnd = Date.now();
        const duration = sessionStartRef.current ? Math.round((sessionEnd - sessionStartRef.current) / (1000 * 60)) : 0;
        const focusPercentage = focusLog.length > 0 ? (focusLog.filter(e => e.status === 'FOCUSED').length / focusLog.length) * 100 : 0;
        
        const newSession: Session = {
            id: sessionStartRef.current || Date.now(),
            date: new Date().toISOString(),
            duration,
            focusPercentage,
            ...newSummaryData,
        };
        addSessionToHistory(newSession);
        
        setCurrentView('SUMMARY');
    } catch (err) {
      console.error("Summary generation failed:", err);
      setError("Failed to generate session summary.");
      setCurrentView('DASHBOARD');
    } finally {
      setIsLoading(false);
    }
  }, [focusLog, addSessionToHistory]);
  
  const handleViewChange = (view: View) => {
    if (isSessionActive) {
        // Prevent navigation away from an active session
        if (view !== 'SESSION') return;
    }
    if(view === 'SESSION') {
        handleStartSession();
    } else {
        setCurrentView(view);
    }
  };


  const renderView = () => {
    if (isLoading) {
        return (
            <div className="text-center">
                <p className="text-xl text-brand-secondary animate-pulse">Generating your focus summary...</p>
            </div>
        );
    }
    switch(currentView) {
        case 'SESSION':
            return (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
                    <CameraFeed 
                        ref={videoRef} 
                        isSessionActive={isSessionActive} 
                        status={focusStatus}
                        elapsedTime={elapsedTime}
                    />
                     <button onClick={handleEndSession} className="flex items-center justify-center px-8 py-4 text-white font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 text-lg bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-500/80 hover:to-red-500/80">End Session</button>
                </div>
            );
        case 'SUMMARY':
            return summaryData && <SessionSummary summaryData={summaryData} onReset={() => setCurrentView('DASHBOARD')} />;
        case 'HISTORY':
            return <History sessions={sessionHistory} />;
        case 'DASHBOARD':
        default:
            return <Dashboard onStartSession={handleStartSession} sessionHistory={sessionHistory} />;
    }
  }

  return (
    <div className="h-full w-full flex flex-col font-sans">
      <header className="w-full max-w-5xl mx-auto flex items-center justify-center py-4 px-4 flex-shrink-0">
        <LogoIcon />
        <h1 className="text-2xl sm:text-3xl font-bold text-white ml-3">{viewTitles[currentView]}</h1>
      </header>
      
      <main className="flex-grow w-full max-w-5xl mx-auto flex flex-col items-center justify-center p-4 overflow-y-auto">
        {renderView()}
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}
      </main>
      
      <canvas ref={canvasRef} className="hidden"></canvas>
      
      {!isSessionActive && currentView !== 'SUMMARY' && (
         <BottomNav currentView={currentView} setView={handleViewChange} />
      )}
    </div>
  );
}