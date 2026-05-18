import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
const { createThemes } = require('tw-colors')

const providerColors = {
  apple: '#000000',
  bitbucket: '#0052CC',
  discord: '#5865F2',
  facebook: '#1877F2',
  github: '#181717',
  gitlab: '#FC6D26',
  google: '#4285F4',
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  microsoft: '#5E5E5E',
  oidc: '#F78C40',
  openshift: '#EE0000',
  paypal: '#00457C',
  slack: '#4A154B',
  stackoverflow: '#F58025',
  twitter: '#1DA1F2',
}

export default {
  content: ['./theme/**/*.ftl'],
  experimental: {
    optimizeUniversalDefaults: true,
  },
  plugins: [
    require('@tailwindcss/forms'),
    createThemes({
      keywind: {
        primary: colors.blue,
        secondary: colors.gray,
        provider: providerColors,
      },
      minty: {
        primary: {
          '50': "#a0e8e4",
          '100': "#93dfdd",
          '200': "#85d7d6",
          '300': "#78cece",
          '400': "#6ac5c7",
          '500': "#5dbdc0",
          '600': "#4fb4b9",
          '700': "#41abb2",
          '800': "#34a2aa",
          '900': "#279aa3",
          '950': "#19919c",
        },
        secondary: colors.gray,
        provider: providerColors,
      },
    })
  ],
} satisfies Config
