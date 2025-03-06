import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import questionsData from './36_questions.json'; // your flat array of 36 questions

export default function GameScreen36({ navigation }) {
  const sequentialQuestions = questionsData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLevelScreen, setShowLevelScreen] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);

  // Calculate level based on currentIndex (each level has 12 questions)
  const level = Math.floor(currentIndex / 12) + 1;

  const levelAnim = useRef(new Animated.Value(1)).current;
  const questionAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Only show level animation if this is the first question of a level
    if (currentIndex % 12 === 0) {
      levelAnim.setValue(1);
      questionAnim.setValue(0);
      buttonsAnim.setValue(0);
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
  }, [currentIndex]);

  const nextQuestion = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= sequentialQuestions.length) {
      navigation.navigate('End');
    } else {
      setCurrentIndex(nextIndex);
    }
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
          <TouchableOpacity style={styles.translationButton} onPress={toggleTranslation}>
            <Animated.View style={{ opacity: buttonsAnim }}>
              <Text style={styles.translationButtonText}>한</Text>
            </Animated.View>
          </TouchableOpacity>
          <Animated.View style={{ opacity: questionAnim, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.questionTitle}>Question {currentIndex + 1}</Text>
            <Text style={styles.questionText}>{currentQuestion.english}</Text>
            {showTranslation && (
              <Text style={styles.translationText}>{currentQuestion.korean}</Text>
            )}
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
  translationButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'transparent',
  },
  translationButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
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
    left: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20, // reduced padding for a smaller button
    paddingVertical: 10,
    borderRadius: 30,
  },
  buttonText: {
    color: '#1C1C1C',
    fontSize: 16, // reduced font size
    fontFamily: 'Poppins_700Bold',
  },
});
