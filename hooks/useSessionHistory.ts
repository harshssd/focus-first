import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '../types';

const STORAGE_KEY = 'focus-session-history';

export function useSessionHistory() {
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedHistory && isMounted) {
          setSessionHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Could not load session history from AsyncStorage', error);
        }
        if (isMounted) {
          setSessionHistory([]);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const addSessionToHistory = useCallback((newSession: Session) => {
    setSessionHistory(prevHistory => {
      const updatedHistory = [newSession, ...prevHistory].slice(0, 50);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory)).catch(error => {
        if (__DEV__) {
          console.warn('Could not save session history to AsyncStorage', error);
        }
      });
      return updatedHistory;
    });
  }, []);

  return { sessionHistory, addSessionToHistory };
}