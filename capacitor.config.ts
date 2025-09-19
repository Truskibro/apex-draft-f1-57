import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a54bafa73948452cb27ce837fab0ff5b',
  appName: 'apex-draft-f1-57',
  webDir: 'dist',
  server: {
    url: 'https://a54bafa7-3948-452c-b27c-e837fab0ff5b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  }
};

export default config;