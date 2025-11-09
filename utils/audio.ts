import { Audio } from 'expo-av';

let audioModeConfigured = false;

async function ensureAudioModeAsync() {
  if (audioModeConfigured) {
    return;
  }
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
    });
    audioModeConfigured = true;
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to configure audio mode', error);
    }
  }
}

export async function playAudio(base64Audio: string) {
  try {
    await ensureAudioModeAsync();
    const sound = new Audio.Sound();
    const source = { uri: `data:audio/mp3;base64,${base64Audio}` };
    await sound.loadAsync(source, { shouldPlay: true });

    sound.setOnPlaybackStatusUpdate(status => {
      if (!status.isLoaded) {
        return;
      }
      if (status.didJustFinish || status.isLooping === false) {
        sound.unloadAsync().catch(() => undefined);
      }
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to play audio', error);
    }
  }
}
