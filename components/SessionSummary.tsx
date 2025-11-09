import React from 'react';
import { RefreshIcon } from './icons';
import type { SessionSummaryData } from '../types';

interface SessionSummaryProps {
  summaryData: SessionSummaryData;
  onReset: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({ summaryData, onReset }) => {
  const { summary, tip, frames } = summaryData;
  return (
    <div className="w-full max-w-3xl bg-black/20 p-6 sm:p-8 rounded-2xl shadow-lg border border-white/10 backdrop-blur-md flex flex-col items-center">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary mb-4">
          Session Complete!
      </h2>
      <p className="text-lg text-gray-200 mb-6 text-center whitespace-pre-wrap">{summary}</p>

      <div className="w-full bg-white/5 p-4 rounded-lg mb-6 text-center">
          <h3 className="text-md font-semibold text-brand-accent mb-2">💡 Pro Tip for Improvement</h3>
          <p className="text-gray-300">{tip}</p>
      </div>
      
      {frames.length > 0 && (
        <div className="w-full mb-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Your Focus Highlights</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {frames.map((frame, index) => (
              <div key={index} className="aspect-square rounded-md overflow-hidden shadow-lg border-2 border-brand-primary/50 transition-transform duration-300 hover:scale-105">
                <img src={frame} alt={`Focus frame ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button
        onClick={onReset}
        className="flex items-center justify-center mt-4 px-6 py-3 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold rounded-full shadow-lg hover:from-brand-primary/80 hover:to-brand-secondary/80 transition-all duration-300 transform hover:scale-105 text-md"
      >
        <RefreshIcon />
        <span className="ml-2">Back to Dashboard</span>
      </button>
    </div>
  );
};