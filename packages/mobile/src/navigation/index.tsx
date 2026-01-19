import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { RootStackParamList } from './types'
import { theme } from '../theme'

// Import screens (we'll create these next)
import { HomeScreen } from '../screens/HomeScreen'
import { ArticleScreen } from '../screens/ArticleScreen'
import { AuthScreen } from '../screens/AuthScreen'
import { BookmarksScreen } from '../screens/BookmarksScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Dystopian Wiki' }}
        />
        <Stack.Screen
          name="Article"
          component={ArticleScreen}
          options={{ title: 'Article' }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ title: 'Sign In' }}
        />
        <Stack.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={{ title: 'Bookmarks' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
