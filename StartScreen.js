import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Easing,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function StartScreen({ navigation }) {
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const figureOpacity = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const rippleDuration = 3000;

  useEffect(() => {
    // Animate header elements sequentially: title -> subtitle -> buttons
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(subtitleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    });

    // Fade in the ripple container concurrently
    Animated.timing(figureOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Delay starting the ripple loop until after the header appears
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: rippleDuration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          // Reset instantly for the next cycle
          Animated.timing(rippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 3000);
  }, []);

  // Random game mode has been removed

  const startGame36 = () => {
    navigation.navigate('Game36');
  };
  
  const startCustomGame = () => {
    navigation.navigate('DeckSelection');
  };
  
  const navigateToFavorites = () => {
    navigation.navigate('Favorites');
  };
  
  const navigateToCustomQuestions = () => {
    navigation.navigate('CustomQuestions');
  };
  
  const navigateToHistory = () => {
    navigation.navigate('History');
  };

  // Define style for the single ripple using its animation value
  const rippleStyle = {
    transform: [
      {
        scale: rippleAnim.interpolate({
          inputRange: [0, 0.8],
          outputRange: [0.5, 2.5],
        }),
      },
    ],
    opacity: rippleAnim.interpolate({
      inputRange: [0, 0.8, 1],
      outputRange: [0, 0.5, 0],
    }),
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Ripple effect behind the title */}
        <Animated.View style={[styles.rippleContainer, { opacity: figureOpacity }]}>
          <Animated.View style={[styles.ripple, rippleStyle]} />
        </Animated.View>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Deeper
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleAnim }]}>
          Into Deeper Human Connections
        </Animated.Text>
      </View>
      
      <Animated.View style={{ opacity: buttonAnim, width: '100%', alignItems: 'center' }}>
        <TouchableOpacity style={styles.button} onPress={startGame36}>
          <Text style={styles.buttonText}>Original 36</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { marginTop: 15 }]} 
          onPress={startCustomGame}
        >
          <Text style={styles.buttonText}>Custom</Text>
        </TouchableOpacity>
        
        <View style={styles.smallButtonsContainer}>
          <TouchableOpacity 
            style={styles.smallButton} 
            onPress={navigateToFavorites}
          >
            <Ionicons name="heart" size={20} color="#FFFFFF" />
            <Text style={styles.smallButtonText}>Favorites</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.smallButton} 
            onPress={navigateToCustomQuestions}
          >
            <Ionicons name="create" size={20} color="#FFFFFF" />
            <Text style={styles.smallButtonText}>Create</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.smallButton} 
            onPress={navigateToHistory}
          >
            <Ionicons name="time" size={20} color="#FFFFFF" />
            <Text style={styles.smallButtonText}>History</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleContainer: {
    position: 'absolute',
    top: 0,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 36,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    marginBottom: 60,
  },
  button: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#1C1C1C',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  smallButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    width: '90%',
    flexWrap: 'wrap',
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    marginLeft: 6,
  }
});