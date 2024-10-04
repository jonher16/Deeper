// StartScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function StartScreen({ navigation }) {
  const startGame = () => {
    navigation.navigate('Game', { level: 1 });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How Deep Will You Go?</Text>
      <TouchableOpacity style={styles.button} onPress={startGame}>
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    marginBottom: 50,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
  },
});
