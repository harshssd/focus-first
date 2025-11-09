export default ({ config }: { config: Record<string, unknown> }) => ({
  ...config,
  name: 'AI Focus Coach',
  slug: 'ai-focus-coach',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {
    permissions: ['CAMERA', 'RECORD_AUDIO'],
  },
  web: {
    bundler: 'metro',
  },
  extra: {
    eas: {
      projectId: '00000000-0000-0000-0000-000000000000',
    },
    geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  },
});
