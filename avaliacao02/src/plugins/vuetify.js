import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'

const libraryLight = {
  dark: false,
  colors: {
    primary: '#4A6C6F',
    secondary: '#F5E9D6',
    background: '#FDF8F0',
    surface: '#FFFFFF',
    accent: '#C7925B',
    info: '#3F51B5',
    success: '#4CAF50',
    warning: '#FFB300',
    error: '#D32F2F',
  },
}

const libraryDark = {
  dark: true,
  colors: {
    primary: '#93C5FD',
    secondary: '#374151',
    background: '#4a586fff',
    surface: '#1F2933',
    accent: '#FBBF24',
    info: '#60A5FA',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
  },
}

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'libraryLight',
    themes: {
      libraryLight,
      libraryDark,
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
})
