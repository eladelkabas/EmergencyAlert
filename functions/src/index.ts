import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();

type AlertLevel = 'green' | 'orange' | 'red';
type TeamId = 'team1' | 'team2' | 'all';

interface AlertDoc {
  level: AlertLevel;
  teamTarget: TeamId;
  message?: string;
  sentBy: string;
}

interface UserDoc {
  fcmToken?: string;
  teamId: TeamId;
  displayName?: string;
}

const CHANNEL_ID: Record<AlertLevel, string> = {
  red: 'alerts-red',
  orange: 'alerts-orange',
  green: 'alerts-green',
};

const TITLE: Record<AlertLevel, string> = {
  red: '🚨 חירום!',
  orange: '🟠 אירוע פעיל',
  green: '🟢 עדכון',
};

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  sound: 'default' | { critical: boolean; name: 'default'; volume: number };
  channelId: string;
  priority: 'high' | 'normal';
  data: Record<string, unknown>;
  _contentAvailable?: boolean;
}

async function sendExpoBatch(messages: ExpoMessage[]): Promise<void> {
  if (messages.length === 0) return;
  const chunks: ExpoMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }
  for (const chunk of chunks) {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      console.error('expo push failed', res.status, await res.text());
    }
  }
}

export const onAlertCreated = onDocumentCreated(
  'alerts/{alertId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const alert = snap.data() as AlertDoc;

    const db = getFirestore();
    let query = db.collection('users').where('fcmToken', '!=', null);
    if (alert.teamTarget !== 'all') {
      query = db
        .collection('users')
        .where('teamId', 'in', [alert.teamTarget, 'all'])
        .where('fcmToken', '!=', null);
    }
    const users = await query.get();

    const body = alert.message?.trim()
      ? alert.message
      : TITLE[alert.level];

    const messages: ExpoMessage[] = [];
    users.forEach((doc) => {
      const u = doc.data() as UserDoc;
      const token = u.fcmToken;
      if (!token) return;
      if (!token.startsWith('ExponentPushToken') && !token.startsWith('ExpoPushToken')) return;
      messages.push({
        to: token,
        title: TITLE[alert.level],
        body,
        sound:
          alert.level === 'red'
            ? { critical: true, name: 'default', volume: 1 }
            : 'default',
        channelId: CHANNEL_ID[alert.level],
        priority: alert.level === 'green' ? 'normal' : 'high',
        data: {
          alertId: event.params.alertId,
          level: alert.level,
          teamTarget: alert.teamTarget,
        },
      });
    });

    await sendExpoBatch(messages);
    console.log(`alert ${event.params.alertId} fanout: ${messages.length} devices`);
  },
);
