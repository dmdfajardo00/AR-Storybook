import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.climatales.ar',
  appName: 'ClimaTales AR',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
