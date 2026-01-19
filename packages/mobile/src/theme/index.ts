export const theme = {
  colors: {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    surfaceHover: '#2a2a2a',
    border: '#2a2a2a',
    borderLight: '#3a3a3a',

    textPrimary: '#ffffff',
    textSecondary: '#c0c0c0',
    textTertiary: '#808080',
    textMuted: '#606060',

    accent: {
      500: '#d4782c',
      400: '#e08940',
      300: '#f0a860',
      600: '#c06820',
    },

    error: '#ff6b6b',
    success: '#4ade80',
    warning: '#fbbf24',
    info: '#60a5fa',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: 'bold' as const,
      lineHeight: 24,
    },
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
}

export type Theme = typeof theme
