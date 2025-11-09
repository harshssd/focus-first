import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FocusIcon, HistoryIcon, HomeIcon } from './icons';
import type { AppView } from '../types';

interface BottomNavProps {
  currentView: AppView;
  onChange: (view: AppView) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onPress: () => void;
}> = ({ label, icon, isActive, onPress }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [
      styles.navItem,
      pressed && styles.navItemPressed,
      isActive && styles.navItemActive,
    ]}
  >
    <View style={styles.navIcon}>{icon}</View>
    <Text style={[styles.navLabel, isActive ? styles.navLabelActive : undefined]}>{label}</Text>
  </Pressable>
);

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChange }) => {
  return (
    <View style={styles.wrapper}>
      <NavItem
        label="Home"
        icon={<HomeIcon size={22} color={currentView === 'DASHBOARD' ? '#F9FAFB' : '#94A3B8'} />}
        isActive={currentView === 'DASHBOARD'}
        onPress={() => onChange('DASHBOARD')}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange('SESSION')}
        style={({ pressed }) => [
          styles.focusButton,
          pressed && { transform: [{ scale: 0.95 }] },
          currentView === 'SESSION' && styles.focusButtonActive,
        ]}
      >
        <FocusIcon size={30} color="#F9FAFB" />
        <Text style={styles.focusButtonText}>Focus</Text>
      </Pressable>
      <NavItem
        label="History"
        icon={<HistoryIcon size={22} color={currentView === 'HISTORY' ? '#F9FAFB' : '#94A3B8'} />}
        isActive={currentView === 'HISTORY'}
        onPress={() => onChange('HISTORY')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
  },
  navItem: {
    alignItems: 'center',
  },
  navItemPressed: {
    opacity: 0.75,
  },
  navItemActive: {
    opacity: 1,
  },
  navIcon: {
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  navLabelActive: {
    color: '#F9FAFB',
  },
  focusButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#6366F1',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 6,
  },
  focusButtonActive: {
    backgroundColor: '#4C1D95',
  },
  focusButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F9FAFB',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginTop: 6,
  },
});
