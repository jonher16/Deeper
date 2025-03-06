// HistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const historyJSON = await AsyncStorage.getItem('questionHistory');
      if (historyJSON !== null) {
        setHistory(JSON.parse(historyJSON));
      }
    } catch (error) {
      console.error('Failed to load history', error);
      Alert.alert('Error', 'Could not load your question history.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your question history?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('questionHistory');
              setHistory([]);
            } catch (error) {
              console.error('Failed to clear history', error);
              Alert.alert('Error', 'Could not clear your history.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const addToFavorites = async (item) => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      // Check if already in favorites
      const alreadyExists = favorites.some(
        fav => fav.english === item.question.english && fav.korean === item.question.korean
      );
      
      if (alreadyExists) {
        Alert.alert('Info', 'This question is already in your favorites.');
        return;
      }
      
      // Add to favorites with current timestamp
      const updatedFavorites = [
        ...favorites, 
        { 
          ...item.question,
          timestamp: new Date().toISOString() 
        }
      ];
      
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      Alert.alert('Success', 'Question added to favorites!');
      
    } catch (error) {
      console.error('Failed to add to favorites', error);
      Alert.alert('Error', 'Could not add to favorites.');
    }
  };

  const renderHistoryItem = ({ item, index }) => {
    // Format the timestamp for display
    const timestamp = new Date(item.timestamp);
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyContent}>
          <View style={styles.historyHeader}>
            {item.question.level && (
              <Text style={styles.levelIndicator}>Level {item.question.level}</Text>
            )}
            <Text style={styles.timestamp}>{formattedDate} at {formattedTime}</Text>
          </View>
          <Text style={styles.questionText}>{item.question.english}</Text>
          <Text style={styles.translationText}>{item.question.korean}</Text>
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => addToFavorites(item)}
          >
            <Ionicons name="heart-outline" size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>Add to Favorites</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={64} color="#AAAAAA" />
      <Text style={styles.emptyText}>Your question history is empty.</Text>
      <Text style={styles.emptySubtext}>
        Questions you view during gameplay will appear here.
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
        <Text style={styles.headerTitle}>Question History</Text>
        {history.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearHistory}>
            <Ionicons name="trash-outline" size={22} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
      />
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
  clearButton: {
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
  historyItem: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  historyContent: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  timestamp: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'Roboto_400Regular',
  },
  questionText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    marginBottom: 8,
  },
  translationText: {
    fontSize: 16,
    color: '#AAAAAA',
    fontFamily: 'Roboto_400Regular',
    marginBottom: 12,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    marginLeft: 6,
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
});