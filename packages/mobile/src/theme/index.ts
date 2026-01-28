/**
 * Dystopian Wiki Mobile Design System
 * Based on MOBILE_UI_DESIGN_SYSTEM_V3.md
 *
 * Navy-tinted dark theme aligned with web brand
 */

// =============================================================================
// RAW COLOR RAMPS
// =============================================================================

export const navy = {
  950: '#050d18', // Deepest background (modals backdrop)
  900: '#0a1628', // bg.base - Primary background
  800: '#0f1f35', // bg.surface1 - Cards, elevated surfaces
  700: '#1e3a5f', // bg.surface2 - Hover states, borders
  600: '#264a78', // bg.surface3 - Active states, strong borders
  500: '#3b6491', // Interactive hover
  400: '#5a8ab8', // Disabled text, subtle icons
  300: '#8cb3d9', // Secondary text alternative
  200: '#b8d4ee', // High contrast text
  100: '#e0eef9', // Inverted backgrounds
  50: '#f0f7fc', // Light mode base (future)
} as const

export const accent = {
  950: '#4a2008', // Darkest accent (rarely used)
  900: '#7c340d', // Dark backgrounds with accent tint
  800: '#9a4014', // Strong pressed states
  700: '#b85a1a', // Pressed state
  600: '#c96820', // Active state
  500: '#d4782c', // PRIMARY - Buttons, links, CTAs
  400: '#e08940', // Hover state
  300: '#f0a860', // Light accent (text on dark)
  200: '#f5c896', // Muted accent (badges)
  100: '#fae3c8', // Very light accent
  50: '#fef3e6', // Accent tinted backgrounds
} as const

// =============================================================================
// SEMANTIC COLOR TOKENS
// =============================================================================

export const colors = {
  // Backgrounds
  bg: {
    base: navy[900], // #0a1628 - Main app background
    surface1: navy[800], // #0f1f35 - Cards, list items
    surface2: navy[700], // #1e3a5f - Nested cards, hovers
    surface3: navy[600], // #264a78 - Active selections
    overlay: 'rgba(5, 13, 24, 0.8)', // navy.950 @ 80% - Modal backdrops
  },

  // Text (Comfort-First - off-white for reading)
  text: {
    primary: '#f1f5f9', // Main content - off-white for reading comfort
    secondary: '#94a3b8', // Supporting text - blue-tinted
    muted: '#64748b', // Disabled, hints, captions
    link: accent[400], // Links, interactive text
    inverse: navy[900], // Text on light backgrounds
  },

  // Borders & Dividers
  border: {
    subtle: navy[700], // Default borders
    strong: navy[600], // Focused/active borders
    accent: accent[500], // Highlighted borders
  },
  divider: {
    default: 'rgba(30, 58, 95, 0.5)', // navy.700 @ 50% - List separators
  },

  // Accent (Orange brand color)
  accent: {
    default: accent[500], // #d4782c - Primary actions
    hover: accent[400], // Hover states
    pressed: accent[600], // Pressed states
    muted: accent[300], // Subtle accent text
  },

  // Status Colors
  status: {
    success: '#4ade80', // Beginner difficulty, positive feedback
    warning: '#fbbf24', // Intermediate difficulty, caution
    error: '#ff6b6b', // Advanced difficulty, destructive actions
    info: '#60a5fa', // Informational messages
  },

  // Interactive
  focus: {
    ring: 'rgba(224, 137, 64, 0.5)', // accent.400 @ 50% - Focus indicator
  },

  // Raw ramps for direct access when needed
  navy,
  accentRamp: accent,
} as const

// =============================================================================
// SPACING (4pt base grid)
// =============================================================================

export const spacing = {
  0: 0,
  1: 4, // Tight padding
  2: 8, // Small gaps
  3: 12, // Medium gaps
  4: 16, // Standard padding
  5: 20, // Section gaps
  6: 24, // Large gaps
  7: 32, // Section separators
  8: 48, // Major sections
  // Named aliases for convenience
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const radius = {
  sm: 4, // Badges, chips
  md: 8, // Buttons, inputs
  lg: 12, // Cards
  xl: 16, // Modals, sheets
  full: 9999, // Pills, avatars
} as const

// =============================================================================
// ELEVATION (Shadows)
// =============================================================================

export const elevation = {
  1: {
    // Subtle lift (chips)
    shadowColor: navy[950],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  2: {
    // Cards
    shadowColor: navy[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  3: {
    // Dropdowns, FAB
    shadowColor: navy[950],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  4: {
    // Modals
    shadowColor: navy[950],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
} as const

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Article headings (Russo One for H1)
  h1: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 34, // 1.2
    // fontFamily: 'RussoOne' - Apply when font is loaded
  },
  h2: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    lineHeight: 29, // 1.3
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    lineHeight: 23, // 1.3
  },
  h4: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    lineHeight: 22,
  },

  // Body text (System fonts for readability)
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24, // 1.5
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20, // 1.4
  },

  // UI elements
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
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },

  // Code blocks
  code: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 22, // 1.6
    // fontFamily: 'JetBrainsMono' - Apply when font is loaded
  },
} as const

// =============================================================================
// ANIMATION TIMING
// =============================================================================

export const animation = {
  duration: {
    instant: 0,
    fast: 80, // Card press
    normal: 120, // Tab switch
    medium: 200, // Pop transition
    slow: 240, // Push transition
    modal: 280, // Modal appear
  },
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    linear: 'linear',
  },
} as const

// =============================================================================
// TOUCH TARGETS (Accessibility)
// =============================================================================

export const touchTarget = {
  minimum: 44, // Minimum touch target size (44x44px)
  comfortable: 48, // Comfortable touch target
  large: 56, // Large buttons
} as const

// =============================================================================
// LEGACY THEME EXPORT (for backward compatibility)
// =============================================================================

export const theme = {
  colors: {
    // Map old names to new semantic tokens
    background: colors.bg.base,
    surface: colors.bg.surface1,
    surfaceHover: colors.bg.surface2,
    border: colors.border.subtle,
    borderLight: colors.border.strong,

    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
    textTertiary: colors.text.muted,
    textMuted: colors.text.muted,

    accent: {
      500: accent[500],
      400: accent[400],
      300: accent[300],
      600: accent[600],
    },

    error: colors.status.error,
    success: colors.status.success,
    warning: colors.status.warning,
    info: colors.status.info,
  },

  spacing: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    xxl: spacing.xxl,
  },

  typography,

  borderRadius: radius,

  shadows: {
    sm: elevation[1],
    md: elevation[2],
    lg: elevation[3],
  },
} as const

export type Theme = typeof theme
