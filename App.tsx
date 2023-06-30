import { StyleSheet } from 'react-native';
import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { FoldersContext } from './contexts/FoldersContext';
import { CardSetsContext } from './contexts/CardSetsContext';
import { CardsContext } from './contexts/CardsContext';

import Home from './screens/Home'
import NewSet from './screens/NewSet';
import Folder from './screens/Folder';
import CardSet from './screens/CardSet';
import NewCard from './screens/NewCard';
import Practice from './screens/Practice';

export interface folder {
  folderID: string;
  title: string;
  color: string;
  inactiveSets: string[];
  activeSets: string[];
}

export interface cardSet {
  cardSetID: string;
  title: string;
  parentFolders: string[];
  remainingCards: string[];
  learnedCards: string[];
  active: boolean;
}

export interface card {
  cardID: string;
  parentSet: string;
  title: string;
  answer: string;
}

export type RootStackParamList = {
  Home: undefined;
  NewSet: undefined
  Folder: {
    folderData: folder
  }
  CardSet: {
    cardSet: cardSet
    color: string
  }
  NewCard: {
    cardData: card | null;
    setID: string
  }
  Practice: {
    setData: cardSet
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const [folders, setFolders] = useState<folder[]>([])
  const [cardSets, setCardSets] = useState<cardSet[]>([])
  const [cards, setCards] = useState<card[]>([])

  useEffect(() => { loadFolders() }, [])

  const loadFolders = async () => {

    const allKeys = await AsyncStorage.getAllKeys()

    const arr1: folder[] = []
    const folderKeys = allKeys.filter(key => key.match(/f[0-9]+/)).sort()

    const arr2: cardSet[] = []
    const setKeys = allKeys.filter(key => key.match(/s[0-9]+/)).sort()

    try {
      for (const key of setKeys) {
        const jsonValue = await AsyncStorage.getItem(key)
        if (jsonValue != null) {
          const parsedSet: cardSet = JSON.parse(jsonValue)
          if (parsedSet.active) {
            arr2.push(JSON.parse(jsonValue))
          }
        }
      }
      setCardSets(arr2)

      for (const key of folderKeys) {
        const jsonValue = await AsyncStorage.getItem(key)
        if (jsonValue != null) {
            arr1.push(JSON.parse(jsonValue))
        }
      }
      setFolders(arr1)


    } catch (e) {
      // error reading value
    }
  }
  return (
    <FoldersContext.Provider value={{ folders, setFolders }}>
      <CardSetsContext.Provider value={{ cardSets, setCardSets }}>
      <CardsContext.Provider value={{ cards, setCards }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName='Home'
            screenOptions={{
              headerStyle: { backgroundColor: '#F2F4F6' },
              headerShadowVisible: false,
              headerTintColor: '#007499',
              headerTitleStyle: { color: '#000000' }
            }}>
            <Stack.Screen
              name='Home'
              component={Home}
              options={{
                title: 'Home',
                headerLargeTitle: true
              }}
            />
            <Stack.Screen
              name='NewSet'
              component={NewSet}
              options={{
                title: 'Home',
                presentation: 'modal',
                headerShown: false
              }}
            />
            <Stack.Screen
              name='Folder'
              component={Folder}
              options={{
                title: 'Folder',
              }}
            />
            <Stack.Screen
              name='CardSet'
              component={CardSet}
              options={{
                title: 'CardSet',
              }}
            />
            <Stack.Screen
              name='NewCard'
              component={NewCard}
              options={{
                title: 'NewCard',
                presentation: 'modal',
                headerShown: false
              }}
            />
            <Stack.Screen
              name='Practice'
              component={Practice}
              options={{
                title: 'Practice',
                presentation: 'fullScreenModal',
                headerShown: false
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        </CardsContext.Provider>
      </CardSetsContext.Provider>
    </FoldersContext.Provider>
  );
}