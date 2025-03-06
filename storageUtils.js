// storageUtils.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for storage
const KEYS = {
  FAVORITES: 'favorites',
  CUSTOM_SETS: 'customQuestionSets',
  RECENT_SESSION: 'recentSession'
};

// Favorites Functions
export const loadFavorites = async () => {
  try {
    const storedFavorites = await AsyncStorage.getItem(KEYS.FAVORITES);
    return storedFavorites !== null ? JSON.parse(storedFavorites) : [];
  } catch (error) {
    console.error('Failed to load favorites', error);
    return [];
  }
};

export const saveFavorites = async (favorites) => {
  try {
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Failed to save favorites', error);
    return false;
  }
};

// Custom Question Sets Functions
export const loadCustomSets = async () => {
  try {
    const storedSets = await AsyncStorage.getItem(KEYS.CUSTOM_SETS);
    return storedSets !== null ? JSON.parse(storedSets) : [];
  } catch (error) {
    console.error('Failed to load custom sets', error);
    return [];
  }
};

export const saveCustomSets = async (customSets) => {
  try {
    await AsyncStorage.setItem(KEYS.CUSTOM_SETS, JSON.stringify(customSets));
    return true;
  } catch (error) {
    console.error('Failed to save custom sets', error);
    return false;
  }
};

export const addCustomSet = async (newSet) => {
  try {
    const currentSets = await loadCustomSets();
    const updatedSets = [...currentSets, newSet];
    return await saveCustomSets(updatedSets);
  } catch (error) {
    console.error('Failed to add custom set', error);
    return false;
  }
};

export const updateCustomSet = async (updatedSet) => {
  try {
    const currentSets = await loadCustomSets();
    const updatedSets = currentSets.map(set => 
      set.id === updatedSet.id ? updatedSet : set
    );
    return await saveCustomSets(updatedSets);
  } catch (error) {
    console.error('Failed to update custom set', error);
    return false;
  }
};

export const deleteCustomSet = async (setId) => {
  try {
    const currentSets = await loadCustomSets();
    const updatedSets = currentSets.filter(set => set.id !== setId);
    return await saveCustomSets(updatedSets);
  } catch (error) {
    console.error('Failed to delete custom set', error);
    return false;
  }
};

// Session Management
export const saveRecentSession = async (sessionData) => {
  try {
    await AsyncStorage.setItem(KEYS.RECENT_SESSION, JSON.stringify(sessionData));
    return true;
  } catch (error) {
    console.error('Failed to save recent session', error);
    return false;
  }
};

export const loadRecentSession = async () => {
  try {
    const recentSession = await AsyncStorage.getItem(KEYS.RECENT_SESSION);
    return recentSession !== null ? JSON.parse(recentSession) : null;
  } catch (error) {
    console.error('Failed to load recent session', error);
    return null;
  }
};

export const clearRecentSession = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.RECENT_SESSION);
    return true;
  } catch (error) {
    console.error('Failed to clear recent session', error);
    return false;
  }
};

// Clear all app data
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.FAVORITES,
      KEYS.CUSTOM_SETS,
      KEYS.RECENT_SESSION
    ]);
    return true;
  } catch (error) {
    console.error('Failed to clear all data', error);
    return false;
  }
};