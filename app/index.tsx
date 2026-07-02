import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import JoinScreen from '../src/screens/JoinScreen';
import HomeScreen from '../src/screens/HomeScreen';

export default function Index() {
  const { loading, isAuthenticated, hasJoined } = useAuth();

  if (loading || !isAuthenticated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#F44336" />
      </View>
    );
  }

  if (!hasJoined) {
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
