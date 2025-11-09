import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import type { FocusStatus } from '../types';

interface CameraFeedProps {
    isSessionActive: boolean;
    status: FocusStatus;
    elapsedTime: number;
}

const statusStyles: Record<FocusStatus, { ring: string, shadow: string, text: string }> = {
  IDLE: { ring: 'stroke-gray-500', shadow: 'drop-shadow-[0_0_8px_rgba(107,114,128,0.7)]', text: 'text-gray-300' },
  ANALYZING: { ring: 'stroke-yellow-400', shadow: 'drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]', text: 'text-yellow-300' },
  FOCUSED: { ring: 'stroke-green-400', shadow: 'drop-shadow-[0_0_12px_rgba(74,222,128,0.8)]', text: 'text-green-300' },
  DISTRACTED: { ring: 'stroke-orange-400', shadow: 'drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]', text: 'text-orange-300' },
  AWAY: { ring: 'stroke-red-500', shadow: 'drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]', text: 'text-red-400' },
};

const statusText: Record<FocusStatus, string> = {
    IDLE: 'IDLE',
    ANALYZING: 'ANALYZING...',
    FOCUSED: 'FOCUSED',
    DISTRACTED: 'DISTRACTED',
    AWAY: 'AWAY',
};

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${paddedMinutes}:${paddedSeconds}`;
}


export const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(({ isSessionActive, status, elapsedTime }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useImperativeHandle(ref, () => videoRef.current!, []);
    
    useEffect(() => {
        const videoElement = videoRef.current;
        if (isSessionActive) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoElement) {
                        videoElement.srcObject = stream;
                        streamRef.current = stream;
                    }
                })
                .catch(err => {
                    console.error("Error accessing camera: ", err);
                    alert("Could not access camera. Please check permissions and try again.");
                });
        } else {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (videoElement) {
                videoElement.srcObject = null;
            }
        }

        return () => {
             if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };

    }, [isSessionActive]);

    const { ring, shadow, text } = statusStyles[status];

    return (
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
        <svg className={`absolute inset-0 w-full h-full animate-pulse-slow ${shadow}`} viewBox="0 0 100 100">
           <circle className={`cx-1/2 cy-1/2 fill-none transition-all duration-500 ${ring}`} cx="50" cy="50" r="48" strokeWidth="4" />
        </svg>
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-brand-dark/50">
           <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
        </div>

        {isSessionActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none space-y-2">
                <div className="bg-black/30 backdrop-blur-sm rounded-xl px-4 py-2">
                    <p className="text-5xl sm:text-6xl font-bold text-white font-mono tracking-wider" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {formatTime(elapsedTime)}
                    </p>
                </div>
                 <p className={`mt-2 text-lg font-semibold uppercase tracking-widest transition-all duration-300 ${text}`} style={{ textShadow: '0 1px 5px rgba(0,0,0,0.7)' }}>
                    {statusText[status]}
                 </p>
            </div>
        )}

        {!isSessionActive && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white p-4 rounded-full">
                 <h2 className="text-xl font-semibold mb-2 text-center">Ready to Focus?</h2>
             </div>
        )}
      </div>
    );
});