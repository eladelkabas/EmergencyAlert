import { useState } from 'react';
import {
  ActivityIndicator,
  Alert as RNAlert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { HE } from '../i18n/he';
import { joinWithInviteCode } from '../services/firestore';

export default function JoinScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { refreshUser } = useAuth();

  async function handleJoin() {
    const code = inviteCode.trim();
    if (!code) {
      RNAlert.alert(HE.join.title, HE.join.empty);
      return;
    }
    const uid = auth.currentUser?.uid;
    if (!uid) {
      RNAlert.alert(HE.errors.generic);
      return;
    }
    setSubmitting(true);
    try {
      await joinWithInviteCode(uid, code);
      await refreshUser();
    } catch (e) {
      const message = e instanceof Error ? e.message : HE.errors.generic;
      RNAlert.alert(HE.join.invalidCode, message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>{HE.join.title}</Text>
        <TextInput
          style={styles.input}
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder={HE.join.placeholder}
          placeholderTextColor="#999"
          textAlign="right"
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!submitting}
        />
        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleJoin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{HE.join.submit}</Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    direction: 'rtl',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    marginBottom: 16,
    writingDirection: 'rtl',
  },
  button: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
