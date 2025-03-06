// FavoritesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [customSets, setCustomSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);

  // Load favorites when component mounts
  useEffect(() => {
    loadFavorites();
    loadCustomSets();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites !== null) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites', error);
      Alert.alert('Error', 'Could not load your favorites.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const saveFavorites = async (updatedFavorites) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Failed to save favorites', error);
      Alert.alert('Error', 'Could not save your changes.');
    }
  };

  const removeFavorite = (index) => {
    Alert.alert(
      'Remove Favorite',
      'Are you sure you want to remove this question from your favorites?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            const updatedFavorites = [...favorites];
            updatedFavorites.splice(index, 1);
            saveFavorites(updatedFavorites);
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const selectLevel = (favorite) => {
    if (favorite.level) {
      return favorite.level;
    }
    // Default level based on question complexity/type if level is not already set
    if (favorite.english.length > 100) {
      return 3; // Longer questions tend to be more deep/personal
    } else if (favorite.english.length > 50) {
      return 2;
    }
    return 1;
  };

  const addToCustomSet = (setId) => {
    if (!selectedFavorite) return;
    
    const favoriteWithLevel = {
      ...selectedFavorite,
      level: selectedLevel, // Use the user-selected level
      id: Date.now().toString() // Ensure unique ID
    };
    
    const updatedSets = customSets.map(set => {
      if (set.id === setId) {
        // Check if question already exists in the set
        const questionExists = set.questions.some(
          q => q.english === selectedFavorite.english && q.korean === selectedFavorite.korean
        );
        
        if (questionExists) {
          Alert.alert('Info', 'This question already exists in the selected set.');
          return set;
        }
        
        return {
          ...set,
          questions: [...set.questions, favoriteWithLevel]
        };
      }
      return set;
    });
    
    // Save updated custom sets
    AsyncStorage.setItem('customQuestionSets', JSON.stringify(updatedSets))
      .then(() => {
        setCustomSets(updatedSets);
        setShowModal(false);
        Alert.alert('Success', `Question added to the selected set as Level ${selectedLevel}!`);
      })
      .catch(error => {
        console.error('Failed to update custom sets', error);
        Alert.alert('Error', 'Could not add question to the set.');
      });
  };

  const openAddToSetModal = (favorite, index) => {
    setSelectedFavorite(favorite);
    // Set default level based on the favorite's existing level or estimate
    setSelectedLevel(favorite.level || selectLevel(favorite));
    setShowModal(true);
  };

  const renderFavoriteItem = ({ item, index }) => (
    <View style={styles.favoriteItem}>
      <View style={styles.favoriteContent}>
        <View style={styles.favoriteHeader}>
          {item.level && (
            <Text style={styles.levelIndicator}>Level {item.level}</Text>
          )}
          <View style={styles.favoriteActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => openAddToSetModal(item, index)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => removeFavorite(index)}
            >
              <Ionicons name="close-circle" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.favoriteText}>{item.english}</Text>
        <Text style={styles.favoriteTranslation}>{item.korean}</Text>
        {item.timestamp && (
          <Text style={styles.timestampText}>
            Saved on {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color="#AAAAAA" />
      <Text style={styles.emptyText}>You don't have any favorite questions yet.</Text>
      <Text style={styles.emptySubtext}>
        Tap the heart icon when viewing a question to add it to your favorites.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorite Questions</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
      />
      
      {/* Modal for adding to a custom set */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Custom Set</Text>
            
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
            
            <Text style={styles.modalSubtitle}>Select a deck to add to:</Text>
            
            <ScrollView style={styles.modalScroll}>
              {customSets.length > 0 ? (
                customSets.map(set => (
                  <TouchableOpacity
                    key={set.id}
                    style={styles.setItem}
                    onPress={() => addToCustomSet(set.id)}
                  >
                    <Text style={styles.setName}>{set.name}</Text>
                    <Text style={styles.questionCount}>{set.questions.length} questions</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.modalEmptyText}>
                  No custom sets found. Create a custom set first.
                </Text>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  favoriteItem: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  favoriteContent: {
    padding: 16,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  favoriteActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 5,
  },
  levelIndicator: {
    fontSize: 14,
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    backgroundColor: '#3A3A3A',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  favoriteText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    marginBottom: 8,
  },
  favoriteTranslation: {
    fontSize: 16,
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'Roboto_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 15,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    marginBottom: 10,
    marginTop: 10,
  },
  levelSelector: {
    marginBottom: 10,
    width: '100%',
  },
  levelSelectorLabel: {
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    marginBottom: 8,
  },
  levelButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 5,
  },
  levelButton: {
    backgroundColor: '#3A3A3A',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  activeLevelButton: {
    backgroundColor: '#FFFFFF',
  },
  levelButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
  },
  activeLevelButtonText: {
    color: '#1C1C1C',
  },
  modalScroll: {
    width: '100%',
    maxHeight: 300,
  },
  setItem: {
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
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
  },
  modalEmptyText: {
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
});