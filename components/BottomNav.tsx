import React from 'react';
import { HomeIcon, FocusIcon, HistoryIcon } from './icons';
import type { View } from '../App';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  view: View;
  isActive: boolean;
  isFocusButton?: boolean;
  onClick: (view: View) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, view, isActive, isFocusButton, onClick }) => {
  if (isFocusButton) {
    return (
      <button onClick={() => onClick(view)} className="flex items-center justify-center w-16 h-16 -mt-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full text-white shadow-lg transform transition-transform hover:scale-110">
        {icon}
      </button>
    );
  }

  const activeClasses = 'text-brand-primary';
  const inactiveClasses = 'text-gray-400 hover:text-white';

  return (
    <button onClick={() => onClick(view)} className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  return (
    <nav className="w-full max-w-md mx-auto bg-gray-900/50 backdrop-blur-lg border-t border-white/10 rounded-t-2xl flex-shrink-0">
      <div className="flex justify-around items-center h-16">
        <NavItem 
          icon={<HomeIcon />} 
          label="Home" 
          view="DASHBOARD"
          isActive={currentView === 'DASHBOARD'}
          onClick={setView}
        />
        <NavItem 
          icon={<FocusIcon />} 
          label="Focus" 
          view="SESSION"
          isActive={currentView === 'SESSION'}
          isFocusButton
          onClick={setView}
        />
        <NavItem 
          icon={<HistoryIcon />} 
          label="History" 
          view="HISTORY"
          isActive={currentView === 'HISTORY'}
          onClick={setView}
        />
      </div>
    </nav>
  );
};