import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { NotificationSetup } from '../src/context/NotificationSetup';
import { LiveAlertOverlay } from '../src/components/LiveAlertOverlay';

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

export default function RootLayout() {
  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
  }, []);

  return (
    <AuthProvider>
      <NotificationSetup />
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
      <LiveAlertOverlay />
    </AuthProvider>
  );
}
