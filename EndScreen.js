// EndScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function EndScreen({ navigation }) {
  const backToStart = () => {
    navigation.navigate('Start');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.endText}>
        The End! You know now each other better than 99% of the people in the world. Keep up your relationship :)
      </Text>
      <TouchableOpacity style={styles.button} onPress={backToStart}>
        <Text style={styles.buttonText}>Back to Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  endText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
});
