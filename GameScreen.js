// GameScreen.js with favorites system
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import questionsData from './questions.json';

export default function GameScreen({ route, navigation }) {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [level, setLevel] = useState(route.params.level);
  const [showLevelScreen, setShowLevelScreen] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const questionAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const levelAnim = useRef(new Animated.Value(1)).current;
  const favoriteAnim = useRef(new Animated.Value(0)).current;

  // Load favorites from storage on component mount
  useEffect(() => {
    loadFavorites();
  }, []);

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

  // Save favorites to storage whenever they change
  useEffect(() => {
    saveFavorites();
  }, [favorites]);

  const saveFavorites = async () => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites', error);
    }
  };

  const getRandomQuestion = () => {
    const levelKey = `Level ${level}`;
    const questions = questionsData[levelKey];
    if (questions && questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      const question = questions[randomIndex];
      setCurrentQuestion(question);
      
      // Check if this question is already in favorites
      const isAlreadyFavorite = favorites.some(
        fav => fav.english === question.english && fav.korean === question.korean
      );
      setIsFavorite(isAlreadyFavorite);
    } else {
      setCurrentQuestion({
        english: 'No questions available.',
        korean: '사용 가능한 질문이 없습니다.',
      });
      setIsFavorite(false);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter(
        q => q.english !== currentQuestion.english || q.korean !== currentQuestion.korean
      );
      setFavorites(updatedFavorites);
      setIsFavorite(false);
      
      // Animation for unfavoriting
      Animated.sequence([
        Animated.timing(favoriteAnim, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(favoriteAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      
    } else {
      // Add to favorites
      const updatedFavorites = [...favorites, { 
        ...currentQuestion,
        level: level,
        timestamp: new Date().toISOString() 
      }];
      setFavorites(updatedFavorites);
      setIsFavorite(true);
      
      // Animation for favoriting
      Animated.sequence([
        Animated.timing(favoriteAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(favoriteAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const viewFavorites = () => {
    // Here we'd navigate to a favorites screen
    // For now, let's just alert the number of favorites
    Alert.alert(
      'Favorites',
      `You have ${favorites.length} favorite questions. A favorites screen would be implemented here.`
    );
  };

  const nextLevel = () => {
    if (level < 3) {
      setLevel(level + 1);
      setShowLevelScreen(true);
    } else {
      navigation.navigate('End');
    }
  };

  useEffect(() => {
    // Show Level Screen Animation
    levelAnim.setValue(1);
    questionAnim.setValue(0);
    buttonsAnim.setValue(0);
    favoriteAnim.setValue(0);

    getRandomQuestion();

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
      Animated.timing(favoriteAnim, {
        toValue: isFavorite ? 1 : 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  }, [level]);

  const onNewQuestion = () => {
    getRandomQuestion();
    // Animate question
    questionAnim.setValue(0);
    favoriteAnim.setValue(0);
    Animated.timing(questionAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    Animated.timing(favoriteAnim, {
      toValue: isFavorite ? 1 : 0,
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
            
            <TouchableOpacity style={styles.headerButton} onPress={viewFavorites}>
              <Animated.View style={{ opacity: buttonsAnim }}>
                <Ionicons name="heart-outline" size={24} color="white" />
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
                    size={24} 
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
    top: 0,
    right: 0,
    padding: 10,
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