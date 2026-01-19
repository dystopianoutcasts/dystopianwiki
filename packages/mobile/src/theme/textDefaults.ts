import { Platform, Text, TextInput } from 'react-native'

/**
 * Configure global text defaults to prevent clipping and wrapping issues
 * after Expo 54 / React Native 0.81 upgrade.
 *
 * This should be called once at app startup.
 */
export const configureTextDefaults = () => {
  const includePaddingStyle =
    Platform.OS === 'android' ? { includeFontPadding: true } : undefined

  // @ts-ignore - defaultProps exists but not in types
  Text.defaultProps = {
    // @ts-ignore
    ...(Text.defaultProps || {}),
    allowFontScaling: false,
    maxFontSizeMultiplier: 1.1,
    // @ts-ignore
    style: [Text.defaultProps?.style, includePaddingStyle].filter(Boolean),
  }

  // @ts-ignore - defaultProps exists but not in types
  TextInput.defaultProps = {
    // @ts-ignore
    ...(TextInput.defaultProps || {}),
    allowFontScaling: false,
    maxFontSizeMultiplier: 1.1,
  }
}
