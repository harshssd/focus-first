import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { FocusStatus, FocusLogEntry, SessionSummaryData } from '../types';

const API_KEY = Constants?.expoConfig?.extra?.geminiApiKey ?? process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY environment variable for Gemini API access.');
}

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiContentPart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType?: string;
  };
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiContentPart[];
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

async function generateContent(model: string, body: Record<string, unknown>): Promise<GeminiResponse> {
  const response = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorMessage}`);
  }

  return response.json();
}

function extractText(candidate?: GeminiCandidate): string {
  if (!candidate?.content?.parts) {
    return '';
  }

  return candidate.content.parts
    .map(part => part.text?.trim() ?? '')
    .filter(Boolean)
    .join(' ');
}

function stripBase64Prefix(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',');
  return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

export async function analyzePosture(base64Image: string): Promise<FocusStatus> {
  const prompt =
    'Analyze this image of someone at their workstation. Respond with only one word: FOCUSED, DISTRACTED, or AWAY.';

  const response = await generateContent('gemini-2.0-flash-exp', {
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: stripBase64Prefix(base64Image),
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
  });

  const normalized = extractText(response.candidates?.[0]).toUpperCase();

  if (normalized.includes('FOCUSED')) return 'FOCUSED';
  if (normalized.includes('DISTRACTED')) return 'DISTRACTED';
  if (normalized.includes('AWAY')) return 'AWAY';

  return 'ANALYZING';
}

export async function generateVoiceFeedback(text: string): Promise<string> {
  const response = await generateContent('gemini-2.0-flash-exp', {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Speak this encouragement in a calm, supportive tone: "${text}"`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: Platform.OS === 'web' ? 'audio/mp3' : 'audio/mp3',
    },
  });

  const audioData =
    response.candidates?.[0]?.content?.parts?.find(part => part.inlineData)?.inlineData?.data;

  if (!audioData) {
    throw new Error('No audio data received from Gemini TTS');
  }

  return audioData;
}

export async function summarizeSession(
  log: FocusLogEntry[],
): Promise<Omit<SessionSummaryData, 'frames'>> {
  const focusedPeriods = log.filter(entry => entry.status === 'FOCUSED');
  if (log.length === 0 || focusedPeriods.length < 2) {
    return {
      summary:
        "Session complete! Every focused moment counts. Let's aim for longer stretches next time.",
      tip: 'Before your next session, set one clear objective. It makes staying on track easier.',
    };
  }

  const totalDurationMinutes =
    (new Date(log[log.length - 1].timestamp).getTime() -
      new Date(log[0].timestamp).getTime()) /
    (1000 * 60);
  const focusPercentage = (focusedPeriods.length / log.length) * 100;

  const distractionTimestamps = log
    .filter(entry => entry.status === 'DISTRACTED' || entry.status === 'AWAY')
    .map(entry => new Date(entry.timestamp).toLocaleTimeString());

  const prompt = `
You are the AI coach for a focus training app. A user just completed a focus session lasting about ${Math.round(
    totalDurationMinutes,
  )} minutes.
They were focused for approximately ${focusPercentage.toFixed(
    0,
  )}% of the recorded check-ins.
Distracted moments were observed around: ${distractionTimestamps.join(', ') || 'none noted'}.

Return valid JSON with:
{
  "summary": "Two upbeat sentences that celebrate what went well.",
  "tip": "One concrete suggestion tailored to their distractions."
}
`;

  const response = await generateContent('gemini-2.0-flash-exp', {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: prompt.trim(),
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const rawText = extractText(response.candidates?.[0]);

  try {
    const parsed = JSON.parse(rawText);
    return {
      summary:
        typeof parsed.summary === 'string'
          ? parsed.summary
          : "Nice work! You stayed present through most of the session.",
      tip:
        typeof parsed.tip === 'string'
          ? parsed.tip
          : 'Try noting distractions as they happen to build awareness.',
    };
  } catch {
    return {
      summary: "Nice work! You stayed present through most of the session.",
      tip: 'Try noting distractions as they happen to build awareness.',
    };
  }
}
