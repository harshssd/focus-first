import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { FocusStatus, FocusLogEntry, SessionSummaryData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function base64ToGenerativePart(base64: string, mimeType: string) {
    return {
        inlineData: {
            data: base64.split(',')[1],
            mimeType
        }
    };
}

export async function analyzePosture(base64Image: string): Promise<FocusStatus> {
    const imagePart = base64ToGenerativePart(base64Image, 'image/jpeg');
    
    const prompt = `Analyze this image of a person at their desk. Are they focused on their work, distracted, or away from the desk? Your answer must be a single word from this list: FOCUSED, DISTRACTED, AWAY.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
    });

    const text = response.text.trim().toUpperCase();

    if (text.includes('FOCUSED')) return 'FOCUSED';
    if (text.includes('DISTRACTED')) return 'DISTRACTED';
    if (text.includes('AWAY')) return 'AWAY';

    return 'ANALYZING';
}


export async function generateVoiceFeedback(text: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: `Say with a calm, encouraging tone: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from TTS API");
    }
    return base64Audio;
}

export async function summarizeSession(log: FocusLogEntry[]): Promise<Omit<SessionSummaryData, 'frames'>> {
    const focusedPeriods = log.filter(entry => entry.status === 'FOCUSED');
    if (log.length === 0 || focusedPeriods.length < 2) {
        return {
            summary: "You just completed a session! Every effort counts. Let's try to build more focus in the next one.",
            tip: "For the next session, try setting a clear, single goal before you start. It can make a huge difference!"
        };
    }

    const totalDuration = (new Date(log[log.length - 1].timestamp).getTime() - new Date(log[0].timestamp).getTime()) / (1000 * 60);
    const focusPercentage = (focusedPeriods.length / log.length) * 100;
    
    const distractionTimestamps = log.filter(e => e.status === 'DISTRACTED' || e.status === 'AWAY').map(e => new Date(e.timestamp).toLocaleTimeString());

    const prompt = `
      A user just finished a focus session of about ${Math.round(totalDuration)} minutes. 
      Their focus level was 'FOCUSED' for ${focusPercentage.toFixed(0)}% of the time.
      They were distracted or away at these times: ${distractionTimestamps.join(', ')}.
      
      Analyze this session data and provide a response in JSON format.
      The JSON object should have two keys:
      1. "summary": A brief, encouraging, and friendly summary (2-3 sentences) of their session. Acknowledge their effort.
      2. "tip": One actionable, concrete tip for improvement for their next session based on when they got distracted.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    tip: { type: Type.STRING }
                },
                required: ['summary', 'tip']
            }
        }
    });
    
    try {
        const result = JSON.parse(response.text);
        return {
            summary: result.summary || "Great session! You showed some real dedication.",
            tip: result.tip || "Keep up the great work in your next session!"
        }
    } catch {
        return {
            summary: "Great session! You showed some real dedication. Keep up the momentum!",
            tip: "Consistency is key. Try to schedule your next focus session for the same time tomorrow."
        }
    }
}