import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { Camera, CameraType } from 'expo-camera';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import type { FocusStatus } from '../types';

export interface CameraFeedHandle {
  captureFrame: () => Promise<string | null>;
}

interface CameraFeedProps {
  isSessionActive: boolean;
  status: FocusStatus;
  elapsedTime: number;
}

const statusStyles: Record<
  FocusStatus,
  { label: string; accent: string; muted: string; ring: string }
> = {
  IDLE: { label: 'Idle', accent: '#9CA3AF', muted: '#6B7280', ring: 'rgba(148, 163, 184, 0.45)' },
  ANALYZING: { label: 'Analyzing', accent: '#FACC15', muted: '#EAB308', ring: 'rgba(250, 204, 21, 0.35)' },
  FOCUSED: { label: 'Locked In', accent: '#34D399', muted: '#059669', ring: 'rgba(34, 197, 94, 0.35)' },
  DISTRACTED: { label: 'Distracted', accent: '#FB923C', muted: '#F97316', ring: 'rgba(249, 115, 22, 0.35)' },
  AWAY: { label: 'Away', accent: '#F87171', muted: '#DC2626', ring: 'rgba(248, 113, 113, 0.35)' },
};

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export const CameraFeed = forwardRef<CameraFeedHandle, CameraFeedProps>(
  ({ isSessionActive, status, elapsedTime }, ref) => {
    const cameraRef = useRef<Camera | null>(null);
    const [permission, requestPermission] = Camera.useCameraPermissions();

    useEffect(() => {
      if (!permission?.granted) {
        requestPermission().catch(error => {
          if (__DEV__) {
            console.warn('Camera permission request failed', error);
          }
        });
      }
    }, [permission?.granted, requestPermission]);

    useImperativeHandle(
      ref,
      () => ({
        captureFrame: async () => {
          if (!cameraRef.current) {
            return null;
          }
          try {
            const photo = await cameraRef.current.takePictureAsync({
              base64: true,
              quality: 0.4,
              skipProcessing: true,
            });
            return photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : null;
          } catch (error) {
            if (__DEV__) {
              console.warn('Failed to capture frame', error);
            }
            return null;
          }
        },
      }),
      [],
    );

    const statusMeta = useMemo(() => statusStyles[status], [status]);

    const handleRequestPermission = useCallback(() => {
      requestPermission().catch(() => undefined);
    }, [requestPermission]);

    if (!permission?.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionDescription}>
            We use your front camera to capture quick snapshots during a focus session. Nothing is
            stored on the device.
          </Text>
          <Pressable style={styles.permissionButton} onPress={handleRequestPermission}>
            <Text style={styles.permissionButtonText}>Enable Camera</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={[styles.ring, { shadowColor: statusMeta.accent, borderColor: statusMeta.ring }]} />
        <View style={styles.cameraShell}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={CameraType.front}
            ratio="16:9"
            autoFocus="on"
          />
          {!isSessionActive && (
            <View style={styles.overlay}>
              <Text style={styles.overlayTitle}>Ready to focus?</Text>
              <Text style={styles.overlaySubtitle}>Start a session to activate live tracking.</Text>
            </View>
          )}
          {isSessionActive && (
            <View style={styles.sessionMeta}>
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: `${statusMeta.accent}20` }]}>
                <View style={[styles.statusDot, { backgroundColor: statusMeta.accent }]} />
                <Text style={[styles.statusText, { color: statusMeta.accent }]}>
                  {statusMeta.label}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: '105%',
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 6,
    opacity: 0.55,
  },
  cameraShell: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  camera: {
    flex: 1,
    transform: [{ scaleX: -1 }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    paddingHorizontal: 24,
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 6,
  },
  overlaySubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  sessionMeta: {
    position: 'absolute',
    bottom: 18,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
  },
  timerText: {
    color: '#F9FAFB',
    fontSize: 18,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  permissionContainer: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#CBD5F5',
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: 18,
    alignSelf: 'flex-start',
    backgroundColor: '#6366F1',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  permissionButtonText: {
    color: '#F9FAFB',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});