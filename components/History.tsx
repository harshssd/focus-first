import React from 'react';
import type { Session } from '../types';

interface HistoryProps {
    sessions: Session[];
}

const SessionCard: React.FC<{ session: Session }> = ({ session }) => (
    <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center border border-transparent hover:border-brand-primary/50 transition-all duration-300">
        <div>
            <p className="font-semibold text-white">{new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-sm text-gray-400">{session.duration} minutes</p>
        </div>
        <div className="text-right">
            <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-accent">
                {session.focusPercentage.toFixed(0)}%
            </p>
            <p className="text-sm text-gray-400">Focused</p>
        </div>
    </div>
);


export const History: React.FC<HistoryProps> = ({ sessions }) => {
    if (sessions.length === 0) {
        return (
            <div className="text-center text-gray-400">
                <h2 className="text-xl text-white font-semibold mb-2">No History Yet</h2>
                <p>Complete your first session to see your stats here.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto h-full flex flex-col space-y-4 overflow-y-auto">
            {sessions.map(session => (
                <SessionCard key={session.id} session={session} />
            ))}
        </div>
    );
};