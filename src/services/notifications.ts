import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const CHANNELS = {
  red: 'alerts-red',
  orange: 'alerts-orange',
  green: 'alerts-green',
} as const;

export async function setupAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNELS.red, {
    name: 'התרעות חירום (אדום)',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 500, 250, 500, 250, 500],
    sound: 'default',
    bypassDnd: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: true,
    enableLights: true,
    lightColor: '#F44336',
  });
  await Notifications.setNotificationChannelAsync(CHANNELS.orange, {
    name: 'התרעות אירוע (כתום)',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 400, 200, 400],
    sound: 'default',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    enableVibrate: true,
  });
  await Notifications.setNotificationChannelAsync(CHANNELS.green, {
    name: 'עדכונים כלליים (ירוק)',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

export async function requestPushPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: true,
      },
    });
    status = req.status;
  }
  return status === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  try {
    const result = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return result.data;
  } catch (e) {
    console.error('getExpoPushToken failed', e);
    return null;
  }
}
