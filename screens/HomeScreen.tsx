/*import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Calendar coming soon</Text>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
*/
 

// screens/HomeScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import CalendarWithWeeks from '../components/CalendarWithWeeks';  // import path

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <CalendarWithWeeks />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
});