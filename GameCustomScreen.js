// GameCustomScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GameCustomScreen({ route, navigation }) {
  const { deckIds = [], isRandomOrder = true } = route.params;
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [customSets, setCustomSets] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [level, setLevel] = useState(1);
  const [showLevelScreen, setShowLevelScreen] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const questionAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const levelAnim = useRef(new Animated.Value(1)).current;
  const favoriteAnim = useRef(new Animated.Value(0)).current;

  // Load custom sets and get questions
  useEffect(() => {
    loadCustomSets();
    loadFavorites();
  }, []);

  const loadCustomSets = async () => {
    try {
      const storedSets = await AsyncStorage.getItem('customQuestionSets');
      if (storedSets !== null) {
        const parsedSets = JSON.parse(storedSets);
        setCustomSets(parsedSets);
        
        // If "default" is included or no specific decks selected, include default questions
        let loadedQuestions = [];
        const defaultDeckId = "default";
        
        // Check if we need to load the default deck
        if (deckIds.includes(defaultDeckId) || deckIds.length === 0) {
          const defaultQuestionsJSON = await AsyncStorage.getItem('defaultQuestions');
          if (defaultQuestionsJSON !== null) {
            const defaultQuestions = JSON.parse(defaultQuestionsJSON);
            loadedQuestions = [...loadedQuestions, ...defaultQuestions];
          }
        }
        
        // Load questions from custom decks
        for (const deckId of deckIds) {
          if (deckId !== defaultDeckId) {
            const deck = parsedSets.find(set => set.id === deckId);
            if (deck) {
              loadedQuestions = [...loadedQuestions, ...deck.questions];
            }
          }
        }
        
        // If no decks were found, show an error
        if (loadedQuestions.length === 0) {
          Alert.alert("Error", "No questions found in selected decks");
          navigation.goBack();
          return;
        }
        
        // Filter questions by level
        const levelQuestions = loadedQuestions.filter(q => q.level === level);
        if (levelQuestions.length > 0) {
          setQuestions(levelQuestions);
          setCurrentQuestion(levelQuestions[0]);
          checkIfFavorite(levelQuestions[0]);
        } else {
          // If no questions for current level, show message
          setCurrentQuestion({
            english: `No questions available for Level ${level}`,
            korean: `레벨 ${level}에 사용할 수 있는 질문이 없습니다`,
            level: level
          });
        }
      }
    } catch (error) {
      console.error('Failed to load custom sets', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites !== null) {
        setFavorites(JSON.parse(storedFavorites));
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
          ...currentQuestion,
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
      console.error('Failed to save favorites', error);
    }
  };

  const addToHistory = async (question) => {
    try {
      const historyJSON = await AsyncStorage.getItem('questionHistory');
      const history = historyJSON ? JSON.parse(historyJSON) : [];
      
      const historyEntry = {
        question: question,
        timestamp: new Date().toISOString(),
        deckIds: deckIds
      };
      
      const updatedHistory = [historyEntry, ...history].slice(0, 100); // Keep only the last 100 items
      await AsyncStorage.setItem('questionHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to update history', error);
    }
  };

  const getNextQuestion = () => {
    const levelQuestions = questions.filter(q => parseInt(q.level) === level);
    if (levelQuestions.length > 0) {
      let nextQuestion;
      let nextIndex;
      
      if (isRandomOrder) {
        // Get a random question from this level
        nextIndex = Math.floor(Math.random() * levelQuestions.length);
        nextQuestion = levelQuestions[nextIndex];
      } else {
        // Get the next question in sequence
        nextIndex = (currentQuestionIndex + 1) % levelQuestions.length;
        nextQuestion = levelQuestions[nextIndex];
      }
      
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(nextQuestion);
      checkIfFavorite(nextQuestion);
      addToHistory(nextQuestion);
    } else {
      setCurrentQuestion({
        english: `No questions available for Level ${level}`,
        korean: `레벨 ${level}에 사용할 수 있는 질문이 없습니다`,
        level: level
      });
    }
  };

  const saveCurrentSession = async () => {
    try {
      const sessionData = {
        type: 'custom',
        deckIds: deckIds,
        level: level,
        questionIndex: currentQuestionIndex
      };
      await AsyncStorage.setItem('recentSession', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Failed to save session', error);
    }
  };

  const nextLevel = async () => {
    if (level < 3) {
      setLevel(level + 1);
      setShowLevelScreen(true);
      setCurrentQuestionIndex(0);
      
      // Save session before moving to next level
      await saveCurrentSession();
    } else {
      // Clear recent session when completing the game
      await AsyncStorage.removeItem('recentSession');
      navigation.navigate('End');
    }
  };

  useEffect(() => {
    // Show Level Screen Animation
    levelAnim.setValue(1);
    questionAnim.setValue(0);
    buttonsAnim.setValue(0);
    favoriteAnim.setValue(1); // Set this to 1 so the icon is visible initially

    // Get level-specific questions when level changes
    const levelQuestions = questions.filter(q => parseInt(q.level) === level);
    if (levelQuestions.length > 0) {
      setCurrentQuestionIndex(0); // Reset index when changing levels
      setCurrentQuestion(levelQuestions[0]);
      checkIfFavorite(levelQuestions[0]);
      addToHistory(levelQuestions[0]);
    } else {
      setCurrentQuestion({
        english: `No questions available for Level ${level}`,
        korean: `레벨 ${level}에 사용할 수 있는 질문이 없습니다`,
        level: level
      });
    }

    Animated.timing(levelAnim, {
      toValue: 0,
      duration: 1000,
      delay: 1000,
      useNativeDriver: true,
    }).start(() => {
      setShowLevelScreen(false);
      // Animate question and buttons
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
  }, [level, questions]);

  const onNewQuestion = () => {
    getNextQuestion();
    // Animate question
    questionAnim.setValue(0);
    Animated.timing(questionAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  return (
    <View style={styles.container}>
      {showLevelScreen ? (
        <Animated.View
          style={[
            styles.levelScreen,
            {
              opacity: levelAnim,
            },
          ]}
        >
          <Text style={styles.levelText}>Level {level}</Text>
        </Animated.View>
      ) : (
        <>
          {/* Header with Translation Toggle and Favorites buttons */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} onPress={toggleTranslation}>
              <Animated.View style={{ opacity: buttonsAnim }}>
                <Text style={styles.headerButtonText}>한</Text>
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('History')}>
              <Animated.View style={{ opacity: buttonsAnim }}>
                <Ionicons name="time-outline" size={24} color="white" />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={{
              opacity: questionAnim,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
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
              
              <Text style={styles.questionText}>{currentQuestion.english}</Text>
              {showTranslation && (
                <Text style={styles.translationText}>{currentQuestion.korean}</Text>
              )}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonsAnim,
              },
            ]}
          >
            <TouchableOpacity style={styles.smallButton} onPress={onNewQuestion}>
              <Text style={styles.buttonText}>New Question</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallButton} onPress={nextLevel}>
              <Text style={styles.buttonText}>
                {level === 3 ? 'End Game' : 'Next Level'}
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
  },
  favoriteButton: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    padding: 15,
    backgroundColor: 'rgba(28, 28, 28, 0.9)',
    borderRadius: 25,
    zIndex: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
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
    flexDirection: 'row',
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    justifyContent: 'space-between',
  },
  smallButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonText: {
    color: '#1C1C1C',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
});