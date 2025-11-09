import React from 'react';
import type { Session } from '../types';

interface ProgressChartProps {
  sessions: Session[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ sessions }) => {
  const data = sessions.slice(0, 7).reverse(); // Get last 7 sessions, oldest first
  
  if (data.length < 2) {
    return (
        <div className="flex items-center justify-center h-48 bg-white/5 rounded-lg">
            <p className="text-gray-400">Complete at least two sessions to see your progress chart.</p>
        </div>
    );
  }

  const width = 300;
  const height = 150;
  const padding = 20;

  const maxVal = 100;
  const xStep = (width - padding * 2) / (data.length - 1);
  const yStep = (height - padding * 2) / maxVal;

  const points = data
    .map((session, i) => {
      const x = padding + i * xStep;
      const y = height - padding - session.focusPercentage * yStep;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${padding},${height-padding} ${points} ${width-padding},${height-padding}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
                <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
            </linearGradient>
        </defs>
        
        {/* Y-axis labels */}
        <text x="5" y={padding} fontSize="8" fill="#9ca3af">100%</text>
        <text x="5" y={height-padding+3} fontSize="8" fill="#9ca3af">0%</text>
        
        {/* Area under the line */}
        <polyline
          fill="url(#areaGradient)"
          points={areaPoints}
        />
        
        {/* The line */}
        <polyline
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          points={points}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
         {/* Circles for data points */}
        {data.map((session, i) => {
          const x = padding + i * xStep;
          const y = height - padding - session.focusPercentage * yStep;
          return <circle key={i} cx={x} cy={y} r="3" fill="#a855f7" stroke="#0f0c29" strokeWidth="1" />;
        })}

        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};