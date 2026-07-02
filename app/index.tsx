import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { isFirebaseConfigured } from '../src/config/firebase';
import { useAuth } from '../src/context/AuthContext';
import ConfigMissingScreen from '../src/screens/ConfigMissingScreen';
import JoinScreen from '../src/screens/JoinScreen';
import HomeScreen from '../src/screens/HomeScreen';

export default function Index() {
  const auth = useAuth();

  if (!isFirebaseConfigured) {
    return <ConfigMissingScreen />;
  }

  if (auth.loading || !auth.isAuthenticated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#F44336" />
      </View>
    );
  }

  if (!auth.hasJoined) {
    return <JoinScreen />;
  }

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
