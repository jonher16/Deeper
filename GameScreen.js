// GameScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import questionsData from './questions.json';

export default function GameScreen({ route, navigation }) {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [level, setLevel] = useState(route.params.level);
  const [showLevelScreen, setShowLevelScreen] = useState(true);

  const questionAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const levelAnim = useRef(new Animated.Value(1)).current;

  const getRandomQuestion = () => {
    const levelKey = `Level ${level}`;
    const questions = questionsData[levelKey];
    if (questions && questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      setCurrentQuestion(questions[randomIndex]);
    } else {
      setCurrentQuestion('No questions available.');
    }
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
    });
  }, [level]);

  const onNewQuestion = () => {
    getRandomQuestion();
    // Animate question
    questionAnim.setValue(0);
    Animated.timing(questionAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
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
          <Animated.Text
            style={[
              styles.questionText,
              {
                opacity: questionAnim,
              },
            ]}
          >
            {currentQuestion}
          </Animated.Text>
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
              <Text style={styles.buttonText}>{level === 3 ? 'End Game' : 'Next Level'}</Text>
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
  questionText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    marginBottom: 100,
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
