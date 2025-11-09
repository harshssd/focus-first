import React from 'react';
import { PlayIcon, ChartBarIcon } from './icons';
import { ProgressChart } from './ProgressChart';
import type { Session } from '../types';

interface DashboardProps {
    onStartSession: () => void;
    sessionHistory: Session[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartSession, sessionHistory }) => {
    const lastSession = sessionHistory[0];

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 space-y-8">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold text-white">Welcome Back</h1>
                <p className="text-lg text-gray-300 mt-2">Ready to get in the zone?</p>
            </div>

            <button
                onClick={onStartSession}
                className="flex items-center justify-center px-10 py-5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-full shadow-lg hover:from-brand-primary/80 hover:to-brand-secondary/80 transition-all duration-300 transform hover:scale-105 text-xl"
            >
                <PlayIcon />
                <span className="ml-3">Start New Session</span>
            </button>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progress Chart */}
                <div className="w-full bg-black/20 p-6 rounded-2xl shadow-lg border border-white/10 backdrop-blur-md">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <ChartBarIcon />
                        <span className="ml-2">Your Focus Trend</span>
                    </h2>
                    <ProgressChart sessions={sessionHistory} />
                </div>
                
                {/* Last Session Stats */}
                <div className="w-full bg-black/20 p-6 rounded-2xl shadow-lg border border-white/10 backdrop-blur-md flex flex-col justify-center">
                    <h2 className="text-xl font-semibold text-white mb-4">Last Session</h2>
                    {lastSession ? (
                        <div className="space-y-3">
                            <p className="text-gray-300">
                                On {new Date(lastSession.date).toLocaleDateString()}
                            </p>
                            <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-accent">
                                {lastSession.focusPercentage.toFixed(0)}%
                                <span className="text-2xl text-gray-300 ml-2">Focused</span>
                            </p>
                             <p className="text-gray-300">
                                for {lastSession.duration} minutes
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-400">You haven't completed any sessions yet. Let's start the first one!</p>
                    )}
                </div>
            </div>
        </div>
    );
};