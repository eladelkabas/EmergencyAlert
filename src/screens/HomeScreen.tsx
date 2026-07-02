import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TEAMS } from '../config/alertTypes';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'מנהל על',
  manager: 'מנהל',
  member: 'חבר צוות',
};

function teamLabel(teamId: string): string {
  if (teamId === 'all') {
    return 'כל הצוותים';
  }
  const team = TEAMS[teamId as keyof typeof TEAMS];
  return team?.label ?? teamId;
}

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>ברוך הבא</Text>
        {user && (
          <View style={styles.info}>
            <Text style={styles.label}>
              תפקיד: {ROLE_LABELS[user.role] ?? user.role}
            </Text>
            <Text style={styles.label}>צוות: {teamLabel(user.teamId)}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 24,
    direction: 'rtl',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'right',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  info: {
    gap: 8,
  },
  label: {
    fontSize: 18,
    textAlign: 'right',
    color: '#333',
  },
});
