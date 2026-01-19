export type RootStackParamList = {
  Home: undefined
  Article: { slug: string }
  Auth: undefined
  Bookmarks: undefined
  Profile: undefined
  Search: undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
