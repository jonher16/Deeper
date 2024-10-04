// GameScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import questionsData from './questions.json';

export default function GameScreen({ route, navigation }) {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [level, setLevel] = useState(route.params.level);

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
      setCurrentQuestion('');
    } else {
      navigation.navigate('End');
    }
  };

  useEffect(() => {
    getRandomQuestion();
  }, [level]);

  return (
    <View style={styles.container}>
      <Text style={styles.levelText}>Level {level}</Text>
      <Text style={styles.questionText}>{currentQuestion}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.smallButton} onPress={getRandomQuestion}>
          <Text style={styles.buttonText}>New Question</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton} onPress={nextLevel}>
          <Text style={styles.buttonText}>{level === 3 ? 'End Game' : 'Next Level'}</Text>
        </TouchableOpacity>
      </View>
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
  levelText: {
    fontSize: 24,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 28,
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
    backgroundColor: '#1E90FF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
