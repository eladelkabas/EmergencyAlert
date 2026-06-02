import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 התרעת חירום</Text>
      <Text style={styles.team}>צוות הסתערבות</Text>
      <View style={styles.button}>
        <Text style={styles.buttonText}>🔴 חירום</Text>
      </View>
      <View style={[styles.button, styles.orange]}>
        <Text style={styles.buttonText}>🟠 אירוע פעיל</Text>
      </View>
      <View style={[styles.button, styles.green]}>
        <Text style={styles.buttonText}>🟢 עדכון כללי</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  team: {
    fontSize: 18,
    color: '#aaa',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#F44336',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 12,
    width: 280,
    alignItems: 'center',
  },
  orange: {
    backgroundColor: '#FF9800',
  },
  green: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
});
