import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import questionsData from './36_questions.json'; // your flat array of 36 questions

export default function GameScreen36({ navigation }) {
  const sequentialQuestions = questionsData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLevelScreen, setShowLevelScreen] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Calculate level based on currentIndex (each level has 12 questions)
  const level = Math.floor(currentIndex / 12) + 1;

  const levelAnim = useRef(new Animated.Value(1)).current;
  const questionAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const favoriteAnim = useRef(new Animated.Value(0)).current;

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites !== null) {
        setFavorites(JSON.parse(storedFavorites));
        
        // Check if current question is favorite
        const currentQuestion = sequentialQuestions[currentIndex];
        checkIfFavorite(currentQuestion);
      }
    } catch (error) {
      console.error('Failed to load favorites', error);
    }
  };

  const checkIfFavorite = (question) => {
    if (!question) return;
    const isAlreadyFavorite = favorites.some(
      fav => fav.english === question.english && fav.korean === question.korean
    );
    setIsFavorite(isAlreadyFavorite);
  };

  const toggleFavorite = async () => {
    try {
      const currentQuestion = sequentialQuestions[currentIndex];
      // Add level information to the question
      const questionWithLevel = {
        ...currentQuestion,
        level: level,
      };
      
      if (isFavorite) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(
          q => q.english !== currentQuestion.english || q.korean !== currentQuestion.korean
        );
        setFavorites(updatedFavorites);
        setIsFavorite(false);
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        
        // Animation for unfavoriting
        Animated.sequence([
          Animated.timing(favoriteAnim, {
            toValue: 0.5,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(favoriteAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Add to favorites
        const updatedFavorites = [...favorites, { 
          ...questionWithLevel,
          timestamp: new Date().toISOString()
        }];
        setFavorites(updatedFavorites);
        setIsFavorite(true);
        await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        
        // Animation for favoriting - more pronounced
        Animated.sequence([
          Animated.timing(favoriteAnim, {
            toValue: 1.5,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(favoriteAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(favoriteAnim, {
            toValue: 1.2,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(favoriteAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error('Failed to update favorites', error);
    }
  };

  const addToHistory = async (question) => {
    try {
      const historyJSON = await AsyncStorage.getItem('questionHistory');
      const history = historyJSON ? JSON.parse(historyJSON) : [];
      
      const historyEntry = {
        question: {
          ...question,
          level: level
        },
        timestamp: new Date().toISOString(),
        gameType: '36'
      };
      
      const updatedHistory = [historyEntry, ...history].slice(0, 100); // Keep only the last 100 items
      await AsyncStorage.setItem('questionHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to update history', error);
    }
  };

  const saveCurrentSession = async () => {
    try {
      const sessionData = {
        type: '36',
        questionIndex: currentIndex
      };
      await AsyncStorage.setItem('recentSession', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to save session', error);
    }
  };

  useEffect(() => {
    // Only show level animation if this is the first question of a level
    if (currentIndex % 12 === 0) {
      levelAnim.setValue(1);
      questionAnim.setValue(0);
      buttonsAnim.setValue(0);
      favoriteAnim.setValue(1); // Set this to 1 so the icon is visible initially
      setShowLevelScreen(true);
      
      Animated.timing(levelAnim, {
        toValue: 0,
        duration: 1000,
        delay: 1000,
        useNativeDriver: true,
      }).start(() => {
        setShowLevelScreen(false);
        Animated.timing(questionAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
        Animated.timing(buttonsAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Directly animate question and buttons if within the same level
      questionAnim.setValue(0);
      buttonsAnim.setValue(0);
      Animated.timing(questionAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
    
    // Save the current session
    saveCurrentSession();
    
    // Add current question to history
    if (currentIndex < sequentialQuestions.length) {
      const currentQuestion = sequentialQuestions[currentIndex];
      addToHistory(currentQuestion);
      checkIfFavorite(currentQuestion);
    }
  }, [currentIndex]);

  const nextQuestion = async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= sequentialQuestions.length) {
      // Clear recent session when completing the game
      await AsyncStorage.removeItem('recentSession');
      navigation.navigate('End');
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const navigateToHistory = () => {
    navigation.navigate('History');
  };

  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const currentQuestion = sequentialQuestions[currentIndex];

  return (
    <View style={styles.container}>
      {showLevelScreen ? (
        <Animated.View style={[styles.levelScreen, { opacity: levelAnim }]}>
          <Text style={styles.levelText}>Level {level}</Text>
        </Animated.View>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={toggleTranslation}>
              <Animated.View style={{ opacity: buttonsAnim }}>
                <Text style={styles.headerButtonText}>한</Text>
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.headerButton} onPress={navigateToHistory}>
              <Animated.View style={{ opacity: buttonsAnim }}>
                <Ionicons name="time-outline" size={24} color="white" />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ opacity: questionAnim, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <View style={styles.questionContainer}>
              <TouchableOpacity 
                style={styles.favoriteButton} 
                onPress={toggleFavorite}
              >
                <Animated.View style={{ 
                  transform: [{ scale: favoriteAnim }],
                }}>
                  <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={28} 
                    color={isFavorite ? "#FF6B6B" : "#FFFFFF"} 
                  />
                </Animated.View>
              </TouchableOpacity>
              
              <Text style={styles.questionTitle}>Question {currentIndex + 1}</Text>
              <Text style={styles.questionText}>{currentQuestion.english}</Text>
              {showTranslation && (
                <Text style={styles.translationText}>{currentQuestion.korean}</Text>
              )}
            </View>
          </Animated.View>

          <Animated.View style={[styles.buttonContainer, { opacity: buttonsAnim }]}>
            <TouchableOpacity style={styles.smallButton} onPress={nextQuestion}>
              <Text style={styles.buttonText}>
                {currentIndex === sequentialQuestions.length - 1 ? 'End Game' : 'Next'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
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
  levelScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerButton: {
    backgroundColor: 'transparent',
    padding: 8,
  },
  headerButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  questionContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40, // Add more top padding to make room for the heart
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    padding: 12,
    backgroundColor: 'rgba(28, 28, 28, 0.8)',
    borderRadius: 22,
    zIndex: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  questionTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 10,
  },
  questionText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  translationText: {
    fontSize: 22,
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonText: {
    color: '#1C1C1C',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
});