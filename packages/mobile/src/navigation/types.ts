import type { NavigatorScreenParams, CompositeNavigationProp, RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'

// =============================================================================
// TAB NAVIGATOR PARAMS
// =============================================================================

export type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>
  SearchTab: NavigatorScreenParams<SearchStackParamList>
  SavedTab: NavigatorScreenParams<SavedStackParamList>
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>
}

// =============================================================================
// STACK NAVIGATOR PARAMS (per tab)
// =============================================================================

export type HomeStackParamList = {
  Home: undefined
  Article: { slug: string }
  Categories: undefined
  CategoryArticles: { category: string; categoryName: string }
}

export type SearchStackParamList = {
  Search: undefined
  Article: { slug: string }
}

export type SavedStackParamList = {
  Bookmarks: undefined
  Article: { slug: string }
}

export type ProfileStackParamList = {
  Profile: undefined
  Settings: undefined
}

// =============================================================================
// ROOT NAVIGATOR (for modals)
// =============================================================================

export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>
  Auth: undefined
}

// =============================================================================
// COMPOSITE NAVIGATION TYPES
// These allow screens to navigate within their stack AND to root modals
// =============================================================================

// Home Tab
export type HomeStackNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>

// Search Tab
export type SearchStackNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<SearchStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>

// Saved Tab
export type SavedStackNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<SavedStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>

// Profile Tab
export type ProfileStackNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>

// =============================================================================
// ROUTE TYPES
// =============================================================================

export type ArticleRouteProp = RouteProp<HomeStackParamList, 'Article'>
export type CategoryArticlesRouteProp = RouteProp<HomeStackParamList, 'CategoryArticles'>

// =============================================================================
// TYPE DECLARATIONS
// =============================================================================

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
