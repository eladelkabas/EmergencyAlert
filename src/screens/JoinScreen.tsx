import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JoinScreen() {
  const [inviteCode, setInviteCode] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>הכנס קוד הזמנה</Text>
        <TextInput
          style={styles.input}
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="קוד הזמנה"
          placeholderTextColor="#999"
          textAlign="right"
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Pressable style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>הצטרף</Text>
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
