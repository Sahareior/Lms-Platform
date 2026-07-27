import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SharedProviders } from '@my-monorepo/store';
import Dashboard from './(components)/Dashboard';

export default function App() {
  return (
    <SharedProviders>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <Dashboard />
        </View>
      </SafeAreaProvider>
    </SharedProviders>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f2',
  },
});
