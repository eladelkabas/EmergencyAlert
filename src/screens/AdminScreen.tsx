import { useCallback, useEffect, useState } from 'react';
import {
  Alert as RNAlert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TEAMS, teamLabel } from '../config/alertTypes';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { HE } from '../i18n/he';
import {
  generateInviteCode,
  listInviteCodes,
  listUsers,
  updateUserRole,
  updateUserTeam,
} from '../services/firestore';
import type { InviteCode, TeamId, User, UserRole } from '../types';

const ROLES: UserRole[] = ['member', 'manager', 'super_admin'];
const TEAM_OPTIONS: TeamId[] = ['team1', 'team2', 'all'];

function teamOptLabel(id: TeamId): string {
  if (id === 'all') return HE.admin.team + ' - כל הצוותים';
  return TEAMS[id].label;
}

export default function AdminScreen() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('member');
  const [teamId, setTeamId] = useState<TeamId>('team1');
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [c, u] = await Promise.all([listInviteCodes(), listUsers()]);
      setCodes(c);
      setUsers(u);
    } catch (e) {
      console.error('admin refresh failed', e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!user || user.role !== 'super_admin') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>{HE.errors.permissionDenied}</Text>
        </View>
      </SafeAreaView>
    );
  }

  async function createCode() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setBusy(true);
    try {
      const code = await generateInviteCode({ role, teamId, createdBy: uid });
      RNAlert.alert(HE.admin.createCode, code.code);
      await refresh();
    } catch (e) {
      const m = e instanceof Error ? e.message : HE.errors.generic;
      RNAlert.alert(HE.errors.generic, m);
    } finally {
      setBusy(false);
    }
  }

  async function cycleRole(u: User) {
    const idx = ROLES.indexOf(u.role);
    const next = ROLES[(idx + 1) % ROLES.length];
    try {
      await updateUserRole(u.uid, next);
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  async function cycleTeam(u: User) {
    const idx = TEAM_OPTIONS.indexOf(u.teamId);
    const next = TEAM_OPTIONS[(idx + 1) % TEAM_OPTIONS.length];
    try {
      await updateUserTeam(u.uid, next);
      await refresh();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{HE.admin.title}</Text>

        <Text style={styles.section}>{HE.admin.createCode}</Text>
        <View style={styles.rowGroup}>
          <Text style={styles.label}>{HE.admin.role}:</Text>
          {ROLES.map((r) => (
            <Pressable
              key={r}
              style={[styles.chip, role === r && styles.chipSelected]}
              onPress={() => setRole(r)}
            >
              <Text style={[styles.chipText, role === r && styles.chipTextSelected]}>
                {HE.roles[r]}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.rowGroup}>
          <Text style={styles.label}>{HE.admin.team}:</Text>
          {TEAM_OPTIONS.map((t) => (
            <Pressable
              key={t}
              style={[styles.chip, teamId === t && styles.chipSelected]}
              onPress={() => setTeamId(t)}
            >
              <Text style={[styles.chipText, teamId === t && styles.chipTextSelected]}>
                {teamLabel(t)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          style={[styles.primaryBtn, busy && styles.disabled]}
          onPress={createCode}
          disabled={busy}
        >
          <Text style={styles.primaryText}>{HE.admin.generate}</Text>
        </Pressable>

        <Text style={styles.section}>{HE.admin.codes}</Text>
        {codes.length === 0 ? (
          <Text style={styles.muted}>—</Text>
        ) : (
          codes.map((c) => (
            <View key={c.code} style={styles.codeRow}>
              <Text style={styles.codeText}>{c.code}</Text>
              <Text style={styles.codeMeta}>
                {HE.roles[c.role]} · {teamLabel(c.teamId)}
              </Text>
              <Text style={[styles.status, c.used && styles.statusUsed]}>
                {c.used ? HE.admin.used : HE.admin.available}
              </Text>
            </View>
          ))
        )}

        <Text style={styles.section}>{HE.admin.users}</Text>
        {users.length === 0 ? (
          <Text style={styles.muted}>—</Text>
        ) : (
          users.map((u) => (
            <View key={u.uid} style={styles.userRow}>
              <Text style={styles.userId} numberOfLines={1}>
                {u.displayName ?? u.uid.slice(0, 8)}
              </Text>
              <Pressable style={styles.smallBtn} onPress={() => cycleRole(u)}>
                <Text style={styles.smallText}>{HE.roles[u.role]}</Text>
              </Pressable>
              <Pressable style={styles.smallBtn} onPress={() => cycleTeam(u)}>
                <Text style={styles.smallText}>{teamLabel(u.teamId)}</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, direction: 'rtl', gap: 8 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'right', color: '#1a1a1a' },
  section: { fontSize: 18, fontWeight: '700', textAlign: 'right', marginTop: 16, color: '#333' },
  label: { fontSize: 14, color: '#555' },
  rowGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: 6 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  chipSelected: { backgroundColor: '#455A64', borderColor: '#455A64' },
  chipText: { color: '#333' },
  chipTextSelected: { color: '#fff' },
  primaryBtn: {
    backgroundColor: '#F44336',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  disabled: { opacity: 0.5 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  muted: { color: '#888', textAlign: 'right' },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginTop: 4,
  },
  codeText: { fontSize: 16, fontWeight: '700', letterSpacing: 2 },
  codeMeta: { fontSize: 12, color: '#555' },
  status: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  statusUsed: { color: '#9E9E9E' },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginTop: 4,
    gap: 6,
  },
  userId: { flex: 1, fontSize: 13, color: '#333' },
  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#455A64',
  },
  smallText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
