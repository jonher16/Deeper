// App.js
import React from 'react';
import { useFonts } from 'expo-font';
import { Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import StartScreen from './StartScreen';
import GameScreen from './GameScreen';
import GameScreen36 from './GameScreen36';
import GameCustomScreen from './GameCustomScreen';
import EndScreen from './EndScreen';
import FavoritesScreen from './FavoritesScreen';
import CustomQuestionsScreen from './CustomQuestionsScreen';
import HistoryScreen from './HistoryScreen';
import DeckSelectionScreen from './DeckSelectionScreen';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Roboto_400Regular,
  });

  if (!fontsLoaded) {
    return null; // or <AppLoading />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Start" 
        screenOptions={{
          cardStyle: {
            backgroundColor: '#1C1C1C',
          },
          headerShown: false,
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 300 } },
            close: { animation: 'timing', config: { duration: 300 } },
          },
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      >
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Game36" component={GameScreen36} />
        <Stack.Screen name="GameCustom" component={GameCustomScreen} />
        <Stack.Screen name="DeckSelection" component={DeckSelectionScreen} />
        <Stack.Screen name="End" component={EndScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="CustomQuestions" component={CustomQuestionsScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}