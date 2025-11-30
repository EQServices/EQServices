import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Platform, View } from 'react-native';
import { LandingPage } from './src/screens/web/LandingPage';
import { SplashOverlay } from './src/components/SplashOverlay';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ToastProvider } from './src/components/Toast';
import { AppWithOffline } from './src/components/AppWithOffline';
import { initializeMonitoring } from './src/config/analytics';
import { useAnalyticsSetup } from './src/hooks/useAnalytics';
import { logger } from './src/services/logger';
import { CookieConsentBanner } from './src/components/CookieConsentBanner';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

export default function App() {
  const isWeb = Platform.OS === 'web';
  const [showApp, setShowApp] = useState(!isWeb);
  const [appIsReady, setAppIsReady] = useState(isWeb);
  const [overlayVisible, setOverlayVisible] = useState(false);

  useEffect(() => {
    if (isWeb) {
      return;
    }

    let mounted = true;

    const prepare = async () => {
      try {
        // Aqui poderíamos carregar fontes, assets, etc.
        await new Promise((resolve) => setTimeout(resolve, 900));
      } finally {
        if (mounted) {
          setAppIsReady(true);
        }
      }
    };

    prepare();

    return () => {
      mounted = false;
    };
  }, [isWeb]);

  useEffect(() => {
    if (!isWeb && appIsReady) {
      SplashScreen.hideAsync().catch(() => {});
      setOverlayVisible(true);
    }
  }, [appIsReady, isWeb]);

  if (!appIsReady && !isWeb) {
    return (
      <ThemeProvider>
        <SplashOverlay duration={1600} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        {showApp ? (
          <AppWithOffline>
            <View style={{ flex: 1 }}>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
              <StatusBar style="light" />
              {!isWeb && overlayVisible ? (
                <SplashOverlay duration={700} onFinish={() => setOverlayVisible(false)} />
              ) : null}
              {isWeb && <CookieConsentBanner />}
            </View>
          </AppWithOffline>
        ) : (
          <LandingPage onEnterApp={() => setShowApp(true)} />
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  useAnalyticsSetup();

  useEffect(() => {
    initializeMonitoring().catch((error) => {
      logger.error('Erro ao inicializar monitoramento', { error });
    });
  }, []);

  return <AppNavigator />;
}
