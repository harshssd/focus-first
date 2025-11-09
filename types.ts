export type FocusStatus = 'IDLE' | 'FOCUSED' | 'DISTRACTED' | 'AWAY' | 'ANALYZING';

export interface FocusLogEntry {
  timestamp: string; // ISO string for serialization
  status: FocusStatus;
  frame?: string; // base64 encoded image
}

export interface Session {
  id: number; // Start timestamp
  date: string; // ISO string
  duration: number; // in minutes
  focusPercentage: number;
  summary: string;
  tip: string;
  frames: string[];
}

export interface SessionSummaryData {
    summary: string;
    tip: string;
    frames: string[];
}