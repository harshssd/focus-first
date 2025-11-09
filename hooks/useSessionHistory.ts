import { useState, useCallback, useEffect } from 'react';
import type { Session } from '../types';

const STORAGE_KEY = 'focus-session-history';

export function useSessionHistory() {
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        setSessionHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Could not load session history from localStorage", error);
      setSessionHistory([]);
    }
  }, []);

  const addSessionToHistory = useCallback((newSession: Session) => {
    setSessionHistory(prevHistory => {
      const updatedHistory = [newSession, ...prevHistory].slice(0, 50); // Keep last 50 sessions
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Could not save session history to localStorage", error);
      }
      return updatedHistory;
    });
  }, []);

  return { sessionHistory, addSessionToHistory };
}