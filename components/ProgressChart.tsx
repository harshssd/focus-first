import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop, Circle as SvgCircle } from 'react-native-svg';
import type { Session } from '../types';

interface ProgressChartProps {
  sessions: Session[];
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;
const PADDING = 20;

export const ProgressChart: React.FC<ProgressChartProps> = ({ sessions }) => {
  const data = useMemo(
    () => sessions.slice(0, 7).reverse(), // last 7 sessions, oldest first
    [sessions],
  );

  const chartContent = useMemo(() => {
    if (data.length < 2) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Complete at least two sessions to unlock your progress trend.
          </Text>
        </View>
      );
    }

    const xStep = data.length > 1 ? (CHART_WIDTH - PADDING * 2) / (data.length - 1) : 0;
    const yScale = (CHART_HEIGHT - PADDING * 2) / 100;

    const points = data.map((session, index) => {
      const x = PADDING + index * xStep;
      const y = CHART_HEIGHT - PADDING - session.focusPercentage * yScale;
      return { x, y, value: session.focusPercentage };
    });

    const linePath = points.reduce((acc, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${acc} ${command} ${point.x} ${point.y}`;
    }, '');

    const areaPath = `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT - PADDING} L ${points[0].x} ${
      CHART_HEIGHT - PADDING
    } Z`;

    return (
      <Svg width="100%" height="100%" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <Defs>
          <LinearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="rgba(99, 102, 241, 0.32)" />
            <Stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
          </LinearGradient>
          <LinearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#6366F1" />
            <Stop offset="100%" stopColor="#EC4899" />
          </LinearGradient>
        </Defs>

        {[0, 50, 100].map(value => {
          const y = CHART_HEIGHT - PADDING - value * yScale;
          return (
            <Path
              key={value}
              d={`M ${PADDING} ${y} H ${CHART_WIDTH - PADDING}`}
              stroke="rgba(148, 163, 184, 0.25)"
              strokeWidth={1}
              strokeDasharray="6 6"
            />
          );
        })}

        <Path d={areaPath} fill="url(#chartArea)" opacity={0.85} />
        <Path d={linePath} stroke="url(#chartLine)" strokeWidth={3} fill="none" strokeLinecap="round" />

        {points.map(point => (
          <SvgCircle
            key={point.x}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="#EEF2FF"
            stroke="#4338CA"
            strokeWidth={1.5}
          />
        ))}
      </Svg>
    );
  }, [data]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.chart}>{chartContent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  chart: {
    height: 180,
    width: '100%',
  },
  emptyState: {
    height: 160,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
