import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getExpoPushToken,
  requestPushPermissions,
  setupAndroidChannels,
} from '../services/notifications';
import { updateUserFcmToken } from '../services/firestore';

export function NotificationSetup() {
  const { user } = useAuth();

  useEffect(() => {
    setupAndroidChannels().catch((e) => console.error('channels setup failed', e));
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const granted = await requestPushPermissions();
      if (!granted || cancelled) return;
      const token = await getExpoPushToken();
      if (!token || cancelled) return;
      if (user.fcmToken === token) return;
      try {
        await updateUserFcmToken(user.uid, token);
      } catch (e) {
        console.error('save token failed', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return null;
}
