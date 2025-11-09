import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, type SvgProps } from 'react-native-svg';

type IconProps = SvgProps & {
  color?: string;
  size?: number;
};

const defaultSize = 24;
const defaultColor = '#E5E7EB';

export const PlayIcon: React.FC<IconProps> = ({ color = defaultColor, size = defaultSize, ...rest }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <Path
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.65}
    />
  </Svg>
);

export const StopIcon: React.FC<IconProps> = ({ color = defaultColor, size = defaultSize, ...rest }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <Path d="M10 9v6m4-6v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.65}
    />
  </Svg>
);

export const RefreshIcon: React.FC<IconProps> = ({
  color = defaultColor,
  size = defaultSize,
  ...rest
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <Path
      d="M4 4v5h5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 20v-5h-5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 9a9 9 0 0114.13-5.22m2.09 3.09A9 9 0 015.82 19.22"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.8}
    />
  </Svg>
);

export const ChartBarIcon: React.FC<IconProps> = ({
  color = defaultColor,
  size = defaultSize,
  ...rest
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <Path
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.9}
    />
    <Path
      d="M9 19V9a2 2 0 012-2h2a2 2 0 012 2v10"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.75}
    />
    <Path
      d="M15 19V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.6}
    />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({ color = defaultColor, size = defaultSize, ...rest }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <Path
      d="M3 12l9-9 9 9"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.75}
    />
    <Path
      d="M10 21v-4a1 1 0 011-1h2a1 1 0 011 1v4"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.65}
    />
  </Svg>
);

export const FocusIcon: React.FC<IconProps> = ({ color = defaultColor, size = 32, ...rest }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} opacity={0.8} />
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.8} opacity={0.9} />
  </Svg>
);

export const HistoryIcon: React.FC<IconProps> = ({
  color = defaultColor,
  size = defaultSize,
  ...rest
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
    <Path
      d="M12 8v4l3 3"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 12a9 9 0 11-18 0"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.75}
    />
    <Path
      d="M3 12h3m-3 0l2-2"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.65}
    />
  </Svg>
);

export const LogoIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill="url(#gradOuter)" opacity={0.9} />
    <Circle cx={12} cy={12} r={6} fill="url(#gradInner)" opacity={0.85} />
    <Circle cx={12} cy={12} r={2.2} fill="url(#gradCore)" />
    <Defs>
      <LinearGradient id="gradOuter" x1="2" y1="12" x2="22" y2="12">
        <Stop offset="0" stopColor="#8B5CF6" />
        <Stop offset="1" stopColor="#EC4899" />
      </LinearGradient>
      <LinearGradient id="gradInner" x1="6" y1="12" x2="18" y2="12">
        <Stop offset="0" stopColor="#C4B5FD" />
        <Stop offset="1" stopColor="#F9A8D4" />
      </LinearGradient>
      <LinearGradient id="gradCore" x1="10" y1="12" x2="14" y2="12">
        <Stop offset="0" stopColor="#F8FAFC" />
        <Stop offset="1" stopColor="#FCE7F3" />
      </LinearGradient>
    </Defs>
  </Svg>
);
