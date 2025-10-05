
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const coresDark = {
  dark: true,
  colors: {
    background: '#12100E',
    surface:    '#1E1B18',
    primary:    '#8B4513',
    secondary:  '#C08A5C',
    info:       '#CAA472',
    success:    '#65C18C',
    warning:    '#E0B45C',
    error:      '#E57373',
  }
}

const coresLight = {
  dark: false,
  colors: {
    background: '#FAF6F2',
    surface:    '#FFFFFF',
    primary:    '#8B4513', 
    secondary:  '#C08A5C', 
    info:       '#8E6F4E',
    success:    '#3E8E68',
    warning:    '#B9822F',
    error:      '#C75050',
  }
}

export default createVuetify({
  theme: {
    defaultTheme: 'coresDark',
    themes: { coresDark, coresLight }
  }
})
