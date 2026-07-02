import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ALERT_LEVELS } from '../config/alertTypes';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { HE } from '../i18n/he';
import { listenToAlerts } from '../services/firestore';
import type { Alert } from '../types';

export function HomeBanner() {
  const { user } = useAuth();
  const [pending, setPending] = useState<Alert | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const unsub = listenToAlerts(user.teamId, (alerts) => {
      const uid = auth.currentUser?.uid ?? '';
      const active = alerts.find(
        (a) =>
          (a.level === 'red' || a.level === 'orange') &&
          !a.acknowledgedBy.includes(uid),
      );
      setPending(active ?? null);
    });
    return unsub;
  }, [user]);

  if (!pending) return null;
  const meta = ALERT_LEVELS[pending.level];

  return (
    <Pressable
      style={[styles.banner, { backgroundColor: meta.color }]}
      onPress={() => router.push('/history')}
    >
      <Text style={styles.title}>{HE.homeBanner.latestPending}</Text>
      <Text style={styles.level}>{meta.label}</Text>
      {pending.message ? <Text style={styles.message}>{pending.message}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  title: { color: '#fff', fontWeight: '800', fontSize: 16, textAlign: 'right' },
  level: { color: '#fff', fontWeight: '600', fontSize: 14, textAlign: 'right', marginTop: 4 },
  message: { color: '#fff', fontSize: 14, textAlign: 'right', marginTop: 4 },
});
