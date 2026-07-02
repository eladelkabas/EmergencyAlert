import { Alert as RNAlert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { teamLabel } from '../config/alertTypes';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { HE } from '../i18n/he';
import type { UserRole } from '../types';
import { HomeBanner } from '../components/HomeBanner';

function canSend(role: UserRole): boolean {
  return role === 'super_admin' || role === 'manager';
}

function isAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{HE.app.welcome}</Text>
        <HomeBanner />
        <View style={styles.info}>
          <Text style={styles.label}>
            {HE.home.role}: {HE.roles[user.role]}
          </Text>
          <Text style={styles.label}>
            {HE.home.team}: {teamLabel(user.teamId)}
          </Text>
        </View>

        <View style={styles.buttons}>
          {canSend(user.role) && (
            <Pressable
              style={[styles.button, styles.primary]}
              onPress={() => router.push('/alert')}
            >
              <Text style={styles.buttonText}>{HE.home.sendAlert}</Text>
            </Pressable>
          )}
          <Pressable style={styles.button} onPress={() => router.push('/history')}>
            <Text style={styles.buttonText}>{HE.home.history}</Text>
          </Pressable>
          {isAdmin(user.role) && (
            <Pressable style={styles.button} onPress={() => router.push('/admin')}>
              <Text style={styles.buttonText}>{HE.home.admin}</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.button, styles.logout]}
            onPress={() => {
              RNAlert.alert(HE.home.logout, HE.home.logoutConfirm, [
                { text: HE.alert.cancel, style: 'cancel' },
                {
                  text: HE.home.logout,
                  style: 'destructive',
                  onPress: () => {
                    signOut(auth).catch((e) => console.error(e));
                  },
                },
              ]);
            }}
          >
            <Text style={styles.buttonText}>{HE.home.logout}</Text>
          </Pressable>
        </View>
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
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    textAlign: 'right',
    color: '#333',
  },
  buttons: {
    gap: 12,
  },
  button: {
    backgroundColor: '#455A64',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#F44336',
  },
  logout: {
    backgroundColor: '#9E9E9E',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
