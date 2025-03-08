// CustomQuestionsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function CustomQuestionsScreen({ navigation }) {
  const [customSets, setCustomSets] = useState([]);
  const [newSetName, setNewSetName] = useState('');
  const [selectedSet, setSelectedSet] = useState(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // Add new state for filtering questions
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    loadCustomSets();
    
    // Add keyboard show/hide listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    // Clean up listeners on unmount
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const loadCustomSets = async () => {
    try {
      const storedSets = await AsyncStorage.getItem('customQuestionSets');
      if (storedSets !== null) {
        setCustomSets(JSON.parse(storedSets));
      }
    } catch (error) {
      console.error('Failed to load custom sets', error);
    }
  };

  const saveCustomSets = async (updatedSets) => {
    try {
      await AsyncStorage.setItem('customQuestionSets', JSON.stringify(updatedSets));
      setCustomSets(updatedSets);
    } catch (error) {
      console.error('Failed to save custom sets', error);
      Alert.alert('Error', 'Could not save your changes.');
    }
  };

  const createNewSet = () => {
    if (!newSetName.trim()) {
      Alert.alert('Error', 'Please enter a name for your question set');
      return;
    }

    const existingSet = customSets.find(set => set.name === newSetName.trim());
    if (existingSet) {
      Alert.alert('Error', 'A set with this name already exists');
      return;
    }

    const newSet = {
      id: Date.now().toString(),
      name: newSetName.trim(),
      questions: []
    };

    const updatedSets = [...customSets, newSet];
    saveCustomSets(updatedSets);
    setNewSetName('');
    setSelectedSet(newSet);
  };

  const deleteSet = (setId) => {
    Alert.alert(
      'Delete Set',
      'Are you sure you want to delete this question set? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            const updatedSets = customSets.filter(set => set.id !== setId);
            saveCustomSets(updatedSets);
            if (selectedSet && selectedSet.id === setId) {
              setSelectedSet(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const validateSetForSaving = (set) => {
    // Check if the set has at least one question for each level
    const level1Questions = set.questions.filter(q => parseInt(q.level) === 1);
    const level2Questions = set.questions.filter(q => parseInt(q.level) === 2);
    const level3Questions = set.questions.filter(q => parseInt(q.level) === 3);
    
    return level1Questions.length > 0 && level2Questions.length > 0 && level3Questions.length > 0;
  };

  const addQuestionToSet = () => {
    if (!selectedSet) {
      Alert.alert('Error', 'Please select a question set first');
      return;
    }

    if (!newQuestion.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    const updatedSets = customSets.map(set => {
      if (set.id === selectedSet.id) {
        return {
          ...set,
          questions: [
            ...set.questions,
            {
              id: Date.now().toString(),
              english: newQuestion.trim(),
              korean: newTranslation.trim() || 'No translation available',
              level: selectedLevel, // Store as number, not string
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return set;
    });

    saveCustomSets(updatedSets);
    setNewQuestion('');
    setNewTranslation('');
    
    // Update the selected set
    const updatedSelectedSet = updatedSets.find(set => set.id === selectedSet.id);
    setSelectedSet(updatedSelectedSet);
    
    // Check if the set has questions in all levels now
    if (validateSetForSaving(updatedSelectedSet)) {
      Alert.alert('Success', 'This deck now has at least one question in each level and can be used in the game!');
    }
  };

  const deleteQuestion = (questionId) => {
    const updatedSets = customSets.map(set => {
      if (set.id === selectedSet.id) {
        return {
          ...set,
          questions: set.questions.filter(q => q.id !== questionId)
        };
      }
      return set;
    });

    saveCustomSets(updatedSets);
    
    // Update the selected set
    const updatedSelectedSet = updatedSets.find(set => set.id === selectedSet.id);
    setSelectedSet(updatedSelectedSet);
    
    // Check if the set still has questions in all levels
    if (!validateSetForSaving(updatedSelectedSet)) {
      Alert.alert('Warning', 'This deck needs at least one question in each level to be used in the game.');
    }
  };

  // Function to filter questions based on the active filter
  const getFilteredQuestions = () => {
    if (!selectedSet) return [];
    
    if (activeFilter === 'All') {
      return selectedSet.questions;
    } else {
      // Extract level number from filter string "Level X"
      const filterLevel = parseInt(activeFilter.split(' ')[1]);
      return selectedSet.questions.filter(q => parseInt(q.level) === filterLevel);
    }
  };

  // Handle filter button press
  const handleFilterPress = (filter) => {
    setActiveFilter(filter);
  };

  const renderSetItem = (set) => {
    const isValid = validateSetForSaving(set);
    const level1Count = set.questions.filter(q => parseInt(q.level) === 1).length;
    const level2Count = set.questions.filter(q => parseInt(q.level) === 2).length;
    const level3Count = set.questions.filter(q => parseInt(q.level) === 3).length;
    
    return (
      <TouchableOpacity
        key={set.id}
        style={[
          styles.setItem,
          selectedSet && selectedSet.id === set.id && styles.selectedSetItem,
          !isValid && styles.invalidSetItem
        ]}
        onPress={() => setSelectedSet(set)}
      >
        <Text style={styles.setName}>{set.name}</Text>
        <Text style={styles.questionCount}>{set.questions.length} questions</Text>
        <Text style={styles.levelCount}>L1: {level1Count} • L2: {level2Count} • L3: {level3Count}</Text>
        {!isValid && <Text style={styles.warningText}>Needs questions in all levels</Text>}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteSet(set.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderQuestionItem = (question) => (
    <View key={question.id} style={styles.questionItem}>
      <View style={styles.questionContent}>
        <View style={styles.questionHeader}>
          <Text style={styles.levelTag}>Level {question.level}</Text>
          <TouchableOpacity 
            style={styles.deleteQuestionButton}
            onPress={() => deleteQuestion(question.id)}
          >
            <Ionicons name="close-circle" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        <Text style={styles.questionText}>{question.english}</Text>
        <Text style={styles.translationText}>{question.korean}</Text>
      </View>
    </View>
  );

  // Get the questions filtered by the active filter
  const filteredQuestions = getFilteredQuestions();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      enabled={true}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Custom Questions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.content,
          // Add extra padding at the bottom when keyboard is visible
          keyboardVisible && { paddingBottom: 300 }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create New Set</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter set name..."
              placeholderTextColor="#AAAAAA"
              value={newSetName}
              onChangeText={setNewSetName}
            />
            <TouchableOpacity style={styles.addButton} onPress={createNewSet}>
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Question Sets</Text>
          <ScrollView
            horizontal
            contentContainerStyle={styles.setsContainer}
            showsHorizontalScrollIndicator={false}
          >
            {customSets.length > 0 ? (
              customSets.map(renderSetItem)
            ) : (
              <Text style={styles.emptyText}>No custom sets yet. Create one above!</Text>
            )}
          </ScrollView>
        </View>

        {selectedSet && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Add Question to "{selectedSet.name}"
            </Text>
            <View style={styles.addQuestionForm}>
              <View style={styles.levelSelector}>
                <Text style={styles.levelSelectorLabel}>Select Level:</Text>
                <View style={styles.levelButtons}>
                  <TouchableOpacity 
                    style={[styles.levelButton, selectedLevel === 1 && styles.activeLevelButton]} 
                    onPress={() => setSelectedLevel(1)}
                  >
                    <Text style={[styles.levelButtonText, selectedLevel === 1 && styles.activeLevelButtonText]}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.levelButton, selectedLevel === 2 && styles.activeLevelButton]} 
                    onPress={() => setSelectedLevel(2)}
                  >
                    <Text style={[styles.levelButtonText, selectedLevel === 2 && styles.activeLevelButtonText]}>2</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.levelButton, selectedLevel === 3 && styles.activeLevelButton]} 
                    onPress={() => setSelectedLevel(3)}
                  >
                    <Text style={[styles.levelButtonText, selectedLevel === 3 && styles.activeLevelButtonText]}>3</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="Enter your question here..."
                placeholderTextColor="#AAAAAA"
                value={newQuestion}
                onChangeText={setNewQuestion}
                multiline
              />
              <TextInput
                style={styles.textArea}
                placeholder="Enter translation (optional)..."
                placeholderTextColor="#AAAAAA"
                value={newTranslation}
                onChangeText={setNewTranslation}
                multiline
              />
              <TouchableOpacity style={styles.submitButton} onPress={addQuestionToSet}>
                <Text style={styles.buttonText}>Add Question to Level {selectedLevel}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.questionsSection}>
              <Text style={styles.sectionTitle}>Questions in This Set</Text>
              
              <View style={styles.levelFilterButtons}>
                <TouchableOpacity 
                  style={[
                    styles.levelFilterButton,
                    activeFilter === 'All' && styles.activeLevelFilterButton
                  ]}
                  onPress={() => handleFilterPress('All')}
                >
                  <Text style={[
                    styles.levelFilterText,
                    activeFilter === 'All' && styles.activeLevelFilterText
                  ]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.levelFilterButton,
                    activeFilter === 'Level 1' && styles.activeLevelFilterButton
                  ]}
                  onPress={() => handleFilterPress('Level 1')}
                >
                  <Text style={[
                    styles.levelFilterText,
                    activeFilter === 'Level 1' && styles.activeLevelFilterText
                  ]}>Level 1</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.levelFilterButton,
                    activeFilter === 'Level 2' && styles.activeLevelFilterButton
                  ]}
                  onPress={() => handleFilterPress('Level 2')}
                >
                  <Text style={[
                    styles.levelFilterText,
                    activeFilter === 'Level 2' && styles.activeLevelFilterText
                  ]}>Level 2</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.levelFilterButton,
                    activeFilter === 'Level 3' && styles.activeLevelFilterButton
                  ]}
                  onPress={() => handleFilterPress('Level 3')}
                >
                  <Text style={[
                    styles.levelFilterText,
                    activeFilter === 'Level 3' && styles.activeLevelFilterText
                  ]}>Level 3</Text>
                </TouchableOpacity>
              </View>
              
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map(renderQuestionItem)
              ) : (
                <Text style={styles.emptyText}>
                  {activeFilter === 'All' 
                    ? 'No questions in this set. Add one above!' 
                    : `No ${activeFilter} questions in this set.`}
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 150, // Add more bottom padding
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#1C1C1C',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
  setsContainer: {
    paddingBottom: 10,
  },
  setItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 180,
    position: 'relative',
  },
  selectedSetItem: {
    backgroundColor: '#3A3A3A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  invalidSetItem: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  setName: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    marginBottom: 5,
  },
  questionCount: {
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    marginBottom: 5,
  },
  levelCount: {
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    fontSize: 10,
    marginBottom: 5,
  },
  warningText: {
    color: '#FF6B6B',
    fontFamily: 'Roboto_400Regular',
    fontSize: 10,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
  },
  addQuestionForm: {
    marginBottom: 20,
  },
  levelSelector: {
    marginBottom: 15,
  },
  levelSelectorLabel: {
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  levelButtons: {
    flexDirection: 'row',
  },
  levelButton: {
    backgroundColor: '#2A2A2A',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activeLevelButton: {
    backgroundColor: '#FFFFFF',
  },
  levelButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  activeLevelButtonText: {
    color: '#1C1C1C',
  },
  textArea: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  questionsSection: {
    marginTop: 20,
  },
  levelFilterButtons: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  levelFilterButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
  },
  activeLevelFilterButton: {
    backgroundColor: '#4A90E2',
  },
  levelFilterText: {
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
  },
  activeLevelFilterText: {
    fontFamily: 'Poppins_700Bold',
  },
  questionItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  questionContent: {
    flex: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelTag: {
    backgroundColor: '#3A3A3A',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
  },
  questionText: {
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    marginBottom: 5,
  },
  translationText: {
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
  },
  deleteQuestionButton: {
    padding: 5,
  },
  emptyText: {
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    fontStyle: 'italic',
  },
});