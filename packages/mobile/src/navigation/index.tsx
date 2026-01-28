import React from 'react'
import { TouchableOpacity } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import type {
  RootStackParamList,
  TabParamList,
  HomeStackParamList,
  SearchStackParamList,
  SavedStackParamList,
  ProfileStackParamList,
} from './types'
import { colors, spacing, touchTarget, accent } from '../theme'
import { useHaptics } from '../hooks/useHaptics'

// Import screens
import { HomeScreen } from '../screens/HomeScreen'
import { ArticleScreen } from '../screens/ArticleScreen'
import { AuthScreen } from '../screens/AuthScreen'
import { BookmarksScreen } from '../screens/BookmarksScreen'
import { SearchScreen } from '../screens/SearchScreen'
import { CategoriesScreen } from '../screens/CategoriesScreen'
import { CategoryArticlesScreen } from '../screens/CategoryArticlesScreen'
import { ProfileScreen } from '../screens/ProfileScreen'

// =============================================================================
// SHARED SCREEN OPTIONS
// =============================================================================

const screenOptions = {
  headerStyle: {
    backgroundColor: colors.bg.surface1,
  },
  headerTintColor: colors.text.primary,
  headerTitleStyle: {
    fontWeight: 'bold' as const,
  },
  contentStyle: {
    backgroundColor: colors.bg.base,
  },
  animation: 'slide_from_right' as const,
}

// =============================================================================
// STACK NAVIGATORS (nested within tabs)
// =============================================================================

const HomeStack = createNativeStackNavigator<HomeStackParamList>()
const SearchStack = createNativeStackNavigator<SearchStackParamList>()
const SavedStack = createNativeStackNavigator<SavedStackParamList>()
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>()

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Dystopian Wiki' }}
      />
      <HomeStack.Screen
        name="Article"
        component={ArticleScreen}
        options={{ title: 'Article' }}
      />
      <HomeStack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Browse Categories' }}
      />
      <HomeStack.Screen
        name="CategoryArticles"
        component={CategoryArticlesScreen}
        options={({ route }) => ({ title: route.params.categoryName })}
      />
    </HomeStack.Navigator>
  )
}

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={screenOptions}>
      <SearchStack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Search' }}
      />
      <SearchStack.Screen
        name="Article"
        component={ArticleScreen}
        options={{ title: 'Article' }}
      />
    </SearchStack.Navigator>
  )
}

function SavedStackNavigator() {
  return (
    <SavedStack.Navigator screenOptions={screenOptions}>
      <SavedStack.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{ title: 'Saved' }}
      />
      <SavedStack.Screen
        name="Article"
        component={ArticleScreen}
        options={{ title: 'Article' }}
      />
    </SavedStack.Navigator>
  )
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </ProfileStack.Navigator>
  )
}

// =============================================================================
// HAPTIC TAB BAR BUTTON
// =============================================================================

function HapticTabButton(props: any) {
  const haptics = useHaptics()

  return (
    <TouchableOpacity
      {...props}
      onPress={(e) => {
        haptics.light() // Light haptic on tab switch
        props.onPress?.(e)
      }}
    />
  )
}

// =============================================================================
// BOTTOM TAB NAVIGATOR
// =============================================================================

const Tab = createBottomTabNavigator<TabParamList>()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Each stack has its own header
        tabBarStyle: {
          backgroundColor: colors.bg.surface1,
          borderTopColor: colors.border.subtle,
          borderTopWidth: 1,
          height: 60, // Comfortable touch target
          paddingBottom: spacing[2],
          paddingTop: spacing[2],
        },
        tabBarActiveTintColor: accent[500],
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarHideOnKeyboard: true,
        tabBarButton: (props) => <HapticTabButton {...props} />,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Home tab',
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Search tab',
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedStackNavigator}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Saved articles tab',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Profile and settings tab',
        }}
      />
    </Tab.Navigator>
  )
}

// =============================================================================
// ROOT NAVIGATOR (handles modals)
// =============================================================================

const RootStack = createNativeStackNavigator<RootStackParamList>()

export function Navigation() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.bg.base,
          },
        }}
      >
        <RootStack.Screen name="Main" component={TabNavigator} />
        <RootStack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.bg.surface1,
            },
            headerTintColor: colors.text.primary,
            title: 'Sign In',
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}
