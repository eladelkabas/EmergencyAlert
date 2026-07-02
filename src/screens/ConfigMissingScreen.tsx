import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { missingFirebaseConfig } from '../config/firebase';

export default function ConfigMissingScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>הגדרת Firebase חסרה</Text>
        <Text style={styles.body}>
          יש להגדיר את משתני הסביבה בקובץ .env ולהריץ מחדש את המפתח:
        </Text>
        {missingFirebaseConfig.map((k) => (
          <Text key={k} style={styles.code}>
            EXPO_PUBLIC_FIREBASE_{k.replace(/([A-Z])/g, '_$1').toUpperCase()}
          </Text>
        ))}
        <Text style={styles.body}>ראו docs/BOOTSTRAP.md</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 24, direction: 'rtl', gap: 12, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'right', color: '#F44336' },
  body: { fontSize: 16, textAlign: 'right', color: '#333' },
  code: {
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    fontSize: 13,
    textAlign: 'left',
  },
});
