import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.faithbliss.app',
  appName: 'FaithBliss',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
