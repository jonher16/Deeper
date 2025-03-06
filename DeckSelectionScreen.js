// DeckSelectionScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function DeckSelectionScreen({ navigation }) {
  const [customSets, setCustomSets] = useState([]);
  const [selectedDecks, setSelectedDecks] = useState(['default']); // Default deck selected by default
  const [hasDefaultDeck, setHasDefaultDeck] = useState(false);
  const [isRandomOrder, setIsRandomOrder] = useState(true); // Default to random order

  useEffect(() => {
    loadCustomSets();
    checkDefaultDeck();
  }, []);

  const loadCustomSets = async () => {
    try {
      const storedSets = await AsyncStorage.getItem('customQuestionSets');
      if (storedSets !== null) {
        const parsedSets = JSON.parse(storedSets);
        // Only show sets that have at least one question in each level
        const validSets = parsedSets.filter(set => {
          const level1Questions = set.questions.filter(q => parseInt(q.level) === 1);
          const level2Questions = set.questions.filter(q => parseInt(q.level) === 2);
          const level3Questions = set.questions.filter(q => parseInt(q.level) === 3);
          return level1Questions.length > 0 && level2Questions.length > 0 && level3Questions.length > 0;
        });
        setCustomSets(validSets);
      }
    } catch (error) {
      console.error('Failed to load custom sets', error);
    }
  };

  const checkDefaultDeck = async () => {
    try {
      // Check if default deck exists, if not create it
      const defaultDeckExists = await AsyncStorage.getItem('defaultQuestions');
      if (defaultDeckExists === null) {
        await createDefaultDeck();
      }
      setHasDefaultDeck(true);
    } catch (error) {
      console.error('Failed to check/create default deck', error);
    }
  };

  const createDefaultDeck = async () => {
    try {
      // Convert the original questions to the new format with levels
      const level1Data = require('./questions.json')['Level 1'].map(q => ({
        id: `level1_${Math.random().toString(36).substring(7)}`,
        english: q.english,
        korean: q.korean,
        level: 1,  // Make sure this is a number not a string
        timestamp: new Date().toISOString()
      }));
      
      const level2Data = require('./questions.json')['Level 2'].map(q => ({
        id: `level2_${Math.random().toString(36).substring(7)}`,
        english: q.english,
        korean: q.korean,
        level: 2,  // Make sure this is a number not a string
        timestamp: new Date().toISOString()
      }));
      
      const level3Data = require('./questions.json')['Level 3'].map(q => ({
        id: `level3_${Math.random().toString(36).substring(7)}`,
        english: q.english,
        korean: q.korean,
        level: 3,  // Make sure this is a number not a string
        timestamp: new Date().toISOString()
      }));
      
      const defaultQuestions = [...level1Data, ...level2Data, ...level3Data];
      
      // Log the default questions
      console.log("Default deck created with", defaultQuestions.length, "questions");
      const l1count = defaultQuestions.filter(q => q.level === 1).length;
      const l2count = defaultQuestions.filter(q => q.level === 2).length;
      const l3count = defaultQuestions.filter(q => q.level === 3).length;
      console.log(`Level 1: ${l1count}, Level 2: ${l2count}, Level 3: ${l3count}`);
      
      await AsyncStorage.setItem('defaultQuestions', JSON.stringify(defaultQuestions));
      return true;
    } catch (error) {
      console.error('Failed to create default deck', error);
      return false;
    }
  };

  const toggleDeckSelection = (deckId) => {
    setSelectedDecks(prevSelected => {
      if (prevSelected.includes(deckId)) {
        // Remove deck if it's already selected
        return prevSelected.filter(id => id !== deckId);
      } else {
        // Add deck if it's not already selected
        return [...prevSelected, deckId];
      }
    });
  };

  const startGame = () => {
    if (selectedDecks.length === 0) {
      Alert.alert('Error', 'Please select at least one deck to start the game.');
      return;
    }
    
    // Navigate to the custom game screen with selected decks and order preference
    navigation.navigate('GameCustom', { 
      deckIds: selectedDecks,
      isRandomOrder: isRandomOrder
    });
  };

  const renderDeckItem = (deck, isDefault = false) => {
    const isDeckSelected = selectedDecks.includes(isDefault ? 'default' : deck.id);
    const deckId = isDefault ? 'default' : deck.id;
    
    let questionsCount = 0;
    let level1Count = 0;
    let level2Count = 0;
    let level3Count = 0;
    
    if (!isDefault && deck.questions) {
      questionsCount = deck.questions.length;
      level1Count = deck.questions.filter(q => q.level === 1).length;
      level2Count = deck.questions.filter(q => q.level === 2).length;
      level3Count = deck.questions.filter(q => q.level === 3).length;
    }
    
    return (
      <TouchableOpacity
        key={deckId}
        style={[
          styles.deckItem,
          isDeckSelected && styles.selectedDeckItem
        ]}
        onPress={() => toggleDeckSelection(deckId)}
      >
        <View style={styles.deckCheckbox}>
          {isDeckSelected && <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
        </View>
        <View style={styles.deckContent}>
          <Text style={styles.deckName}>{isDefault ? 'Default Questions' : deck.name}</Text>
          {isDefault ? (
            <Text style={styles.deckDescription}>The original Deeper question set</Text>
          ) : (
            <>
              <Text style={styles.questionCount}>{questionsCount} questions total</Text>
              <Text style={styles.levelDistribution}>
                Level 1: {level1Count} • Level 2: {level2Count} • Level 3: {level3Count}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Decks</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Available Decks</Text>
        <Text style={styles.instructionText}>
          Select one or more decks to play with. Questions will be drawn from all selected decks.
        </Text>
        
        {hasDefaultDeck && renderDeckItem(null, true)}
        
        {customSets.map(set => renderDeckItem(set))}
        
        {customSets.length === 0 && (
          <Text style={styles.emptyText}>
            No custom decks available with questions in all levels.
            Create a custom deck with at least one question in each level.
          </Text>
        )}
        
        <View style={styles.orderSection}>
          <Text style={styles.sectionTitle}>Question Order</Text>
          <View style={styles.orderOptions}>
            <TouchableOpacity 
              style={[
                styles.orderOption,
                isRandomOrder && styles.selectedOrderOption
              ]}
              onPress={() => setIsRandomOrder(true)}
            >
              <Ionicons 
                name="shuffle" 
                size={20} 
                color={isRandomOrder ? "#1C1C1C" : "#FFFFFF"} 
              />
              <Text style={[
                styles.orderOptionText,
                isRandomOrder && styles.selectedOrderOptionText
              ]}>Random</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.orderOption,
                !isRandomOrder && styles.selectedOrderOption
              ]}
              onPress={() => setIsRandomOrder(false)}
            >
              <Ionicons 
                name="list" 
                size={20} 
                color={!isRandomOrder ? "#1C1C1C" : "#FFFFFF"} 
              />
              <Text style={[
                styles.orderOptionText,
                !isRandomOrder && styles.selectedOrderOptionText
              ]}>In Order</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={startGame}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.createDeckButton}
            onPress={() => navigation.navigate('CustomQuestions')}
          >
            <Text style={styles.createDeckText}>Create New Deck</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    marginBottom: 20,
  },
  deckItem: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  selectedDeckItem: {
    backgroundColor: '#3A3A3A',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  deckCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deckContent: {
    flex: 1,
  },
  deckName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 5,
  },
  deckDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
  },
  questionCount: {
    fontSize: 14,
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    marginBottom: 5,
  },
  levelDistribution: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'Roboto_400Regular',
  },
  emptyText: {
    fontSize: 14,
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  orderSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  orderOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  orderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 8,
  },
  selectedOrderOption: {
    backgroundColor: '#FFFFFF',
  },
  orderOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    marginLeft: 8,
  },
  selectedOrderOptionText: {
    color: '#1C1C1C',
  },
  actionButtons: {
    marginTop: 30,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButtonText: {
    color: '#1C1C1C',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  createDeckButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  createDeckText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
});