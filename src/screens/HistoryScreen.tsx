import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALERT_LEVELS, teamLabel } from '../config/alertTypes';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { HE } from '../i18n/he';
import { acknowledgeAlert, listenToAlerts } from '../services/firestore';
import type { Alert } from '../types';

function formatTime(d: Date): string {
  return d.toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = listenToAlerts(user.teamId, setAlerts, (e) => {
      console.error('alerts listener error', e);
    });
    return unsub;
  }, [user]);

  async function ack(id: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await acknowledgeAlert(id, uid);
    } catch (e) {
      console.error('ack failed', e);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{HE.history.title}</Text>
        <FlatList
          data={alerts}
          keyExtractor={(a) => a.id}
          ListEmptyComponent={<Text style={styles.empty}>{HE.history.empty}</Text>}
          renderItem={({ item }) => {
            const meta = ALERT_LEVELS[item.level];
            const uid = auth.currentUser?.uid ?? '';
            const acked = item.acknowledgedBy.includes(uid);
            return (
              <View style={[styles.card, { borderRightColor: meta.color }]}>
                <View style={styles.row}>
                  <Text style={[styles.level, { color: meta.color }]}>{meta.label}</Text>
                  <Text style={styles.time}>{formatTime(item.sentAt)}</Text>
                </View>
                <Text style={styles.target}>
                  {HE.home.team}: {teamLabel(item.teamTarget)}
                </Text>
                {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
                <Text style={styles.ackCount}>
                  {HE.history.ackCount}: {item.acknowledgedBy.length}
                </Text>
                <Pressable
                  style={[styles.ackBtn, acked && styles.ackedBtn]}
                  onPress={() => ack(item.id)}
                  disabled={acked}
                >
                  <Text style={styles.ackText}>{acked ? HE.history.acked : HE.history.ack}</Text>
                </Pressable>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 16, direction: 'rtl' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'right', color: '#1a1a1a', marginBottom: 12 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRightWidth: 6,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  level: { fontSize: 18, fontWeight: '700', textAlign: 'right' },
  time: { fontSize: 13, color: '#666' },
  target: { fontSize: 14, color: '#555', marginTop: 4, textAlign: 'right' },
  message: { fontSize: 15, color: '#222', marginTop: 6, textAlign: 'right' },
  ackCount: { fontSize: 13, color: '#666', marginTop: 6, textAlign: 'right' },
  ackBtn: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  ackedBtn: { backgroundColor: '#9E9E9E' },
  ackText: { color: '#fff', fontWeight: '600' },
});
