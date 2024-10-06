// App.js
import React, { useEffect, useState } from 'react';
import AppLoading from 'expo-app-loading'; // Import if needed
import { useFonts } from 'expo-font';
import { Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import StartScreen from './StartScreen';
import GameScreen from './GameScreen';
import EndScreen from './EndScreen';

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
      <Stack.Navigator initialRouteName="Start" screenOptions={{
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
  }}>
        <Stack.Screen name="Start" component={StartScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Game" component={GameScreen} options={{ headerShown: false }} />
        <Stack.Screen name="End" component={EndScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
