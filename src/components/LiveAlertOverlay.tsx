import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { ALERT_LEVELS, teamLabel } from '../config/alertTypes';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { HE } from '../i18n/he';
import { acknowledgeAlert, listenToAlerts } from '../services/firestore';
import type { Alert } from '../types';

const VIBRATION_RED: number[] = [0, 800, 400, 800, 400, 800, 400, 800];
const VIBRATION_ORANGE: number[] = [0, 500, 250, 500];

export function LiveAlertOverlay() {
  const { user } = useAuth();
  const [pending, setPending] = useState<Alert | null>(null);
  const seenIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    if (!user) return;
    initialized.current = false;
    const unsub = listenToAlerts(user.teamId, (alerts) => {
      if (!initialized.current) {
        alerts.forEach((a) => seenIds.current.add(a.id));
        initialized.current = true;
        return;
      }
      const uid = auth.currentUser?.uid ?? '';
      const fresh = alerts.find((a) => {
        if (seenIds.current.has(a.id)) return false;
        if (a.level === 'green') {
          seenIds.current.add(a.id);
          return false;
        }
        if (a.acknowledgedBy.includes(uid)) {
          seenIds.current.add(a.id);
          return false;
        }
        return true;
      });
      alerts.forEach((a) => seenIds.current.add(a.id));
      if (fresh) setPending(fresh);
    });
    return () => {
      unsub();
      Vibration.cancel();
    };
  }, [user]);

  useEffect(() => {
    if (!pending) return;
    const pattern = pending.level === 'red' ? VIBRATION_RED : VIBRATION_ORANGE;
    Vibration.vibrate(pattern, pending.level === 'red');
    return () => {
      Vibration.cancel();
    };
  }, [pending]);

  async function dismiss() {
    if (!pending) return;
    const uid = auth.currentUser?.uid;
    Vibration.cancel();
    const current = pending;
    setPending(null);
    if (uid) {
      try {
        await acknowledgeAlert(current.id, uid);
      } catch (e) {
        console.error('ack failed', e);
      }
    }
  }

  if (!pending) return null;
  const meta = ALERT_LEVELS[pending.level];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismiss}>
      <View style={[styles.backdrop, { backgroundColor: meta.color }]}>
        <Text style={styles.emoji}>🚨</Text>
        <Text style={styles.title}>{HE.liveAlert.title}</Text>
        <Text style={styles.level}>{meta.label}</Text>
        <Text style={styles.team}>
          {HE.home.team}: {teamLabel(pending.teamTarget)}
        </Text>
        {pending.message ? <Text style={styles.message}>{pending.message}</Text> : null}
        <Pressable style={styles.ackBtn} onPress={dismiss}>
          <Text style={styles.ackText}>{HE.liveAlert.ack}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  emoji: { fontSize: 80 },
  title: { fontSize: 40, fontWeight: '900', color: '#fff', textAlign: 'center' },
  level: { fontSize: 24, color: '#fff', fontWeight: '700', textAlign: 'center' },
  team: { fontSize: 20, color: '#fff', textAlign: 'center' },
  message: { fontSize: 18, color: '#fff', textAlign: 'center', paddingHorizontal: 20 },
  ackBtn: {
    marginTop: 32,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  ackText: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
});
