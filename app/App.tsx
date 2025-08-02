import React from 'react';
import { SafeAreaView } from 'react-native';
import HomeScreen from '../screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HomeScreen />
    </SafeAreaView>
  );
}
/*import React from 'react';
import { SafeAreaView, Text } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Hello from App.tsx</Text>
    </SafeAreaView>
  );
}*/