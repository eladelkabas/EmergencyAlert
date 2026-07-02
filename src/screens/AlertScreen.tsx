import { useState } from 'react';
import {
  ActivityIndicator,
  Alert as RNAlert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ALERT_LEVELS, TEAMS, TEAM_ALL_LABEL } from '../config/alertTypes';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { HE } from '../i18n/he';
import { sendAlert } from '../services/firestore';
import type { AlertLevel, TeamId } from '../types';

const TEAM_OPTIONS: TeamId[] = ['team1', 'team2', 'all'];

function teamOptionLabel(id: TeamId): string {
  if (id === 'all') return TEAM_ALL_LABEL;
  return TEAMS[id].label;
}

export default function AlertScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [level, setLevel] = useState<AlertLevel | null>(null);
  const [teamTarget, setTeamTarget] = useState<TeamId>('all');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  if (!user || (user.role !== 'super_admin' && user.role !== 'manager')) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>{HE.errors.permissionDenied}</Text>
        </View>
      </SafeAreaView>
    );
  }

  function submit() {
    if (!level) return;
    RNAlert.alert(HE.alert.confirmTitle, HE.alert.confirmBody, [
      { text: HE.alert.cancel, style: 'cancel' },
      { text: HE.alert.confirm, style: 'destructive', onPress: doSend },
    ]);
  }

  async function doSend() {
    if (!level) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setSending(true);
    try {
      await sendAlert({ level, teamTarget, message: message.trim(), sentBy: uid });
      RNAlert.alert(HE.alert.sent);
      router.back();
    } catch (e) {
      const m = e instanceof Error ? e.message : HE.errors.generic;
      RNAlert.alert(HE.alert.failed, m);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{HE.alert.title}</Text>

        <Text style={styles.section}>{HE.alert.selectLevel}</Text>
        <View style={styles.levels}>
          {(Object.keys(ALERT_LEVELS) as AlertLevel[]).map((lv) => {
            const meta = ALERT_LEVELS[lv];
            const selected = level === lv;
            return (
              <Pressable
                key={lv}
                onPress={() => setLevel(lv)}
                style={[
                  styles.levelBtn,
                  { backgroundColor: meta.color },
                  selected && styles.levelSelected,
                ]}
              >
                <Text style={styles.levelText}>{meta.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>{HE.alert.selectTeam}</Text>
        <View style={styles.teams}>
          {TEAM_OPTIONS.map((t) => {
            const selected = teamTarget === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTeamTarget(t)}
                style={[styles.teamBtn, selected && styles.teamSelected]}
              >
                <Text style={[styles.teamText, selected && styles.teamTextSelected]}>
                  {teamOptionLabel(t)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>{HE.alert.messageLabel}</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={HE.alert.messagePlaceholder}
          placeholderTextColor="#999"
          textAlign="right"
          multiline
        />

        <Pressable
          style={[styles.sendBtn, (!level || sending) && styles.disabled]}
          onPress={submit}
          disabled={!level || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendText}>{HE.alert.send}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, direction: 'rtl', gap: 12 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'right', color: '#1a1a1a' },
  section: { fontSize: 16, fontWeight: '600', textAlign: 'right', color: '#333', marginTop: 8 },
  levels: { gap: 8 },
  levelBtn: { padding: 16, borderRadius: 10, alignItems: 'center', borderWidth: 3, borderColor: 'transparent' },
  levelSelected: { borderColor: '#000' },
  levelText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  teams: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  teamBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  teamSelected: { backgroundColor: '#455A64', borderColor: '#455A64' },
  teamText: { color: '#333', fontSize: 15 },
  teamTextSelected: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, minHeight: 60, textAlignVertical: 'top', writingDirection: 'rtl' },
  sendBtn: { backgroundColor: '#F44336', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  disabled: { opacity: 0.5 },
  sendText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
