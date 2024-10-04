// EndScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

export default function EndScreen({ navigation }) {
  const quoteAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(quoteAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const backToStart = () => {
    navigation.navigate('Start');
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          opacity: quoteAnim,
          transform: [
            {
              translateY: quoteAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <Text style={styles.endTitle}>The End!</Text>
        <Text style={styles.endText}>
          In a world that often forgets to listen, thank you for taking the time to truly connect :) Spread the love!
        </Text>
      </Animated.View>
      <Animated.View style={{ opacity: buttonAnim }}>
        <TouchableOpacity style={styles.button} onPress={backToStart}>
          <Text style={styles.buttonText}>Back to Start</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  endTitle: {
    fontSize: 36,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  endText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonText: {
    color: '#1C1C1C',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
});
