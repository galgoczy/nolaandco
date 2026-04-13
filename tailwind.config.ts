import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#D5E8F0',
        'brand-red': '#D55850',
        primary: '#584232',
        'primary-container': '#725948',
        tertiary: '#C4A591',
        secondary: '#4f6168',
        'secondary-container': '#d3e6ee',
        surface: '#fbf9f8',
        'surface-dim': '#dcd9d9',
        'surface-container': '#f0eded',
        'surface-container-low': '#f6f3f2',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#eae8e7',
        'surface-container-highest': '#e4e2e1',
        'on-surface': '#1b1c1c',
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#55676e',
        outline: '#81756e',
        'outline-variant': '#d2c4bb',
        'warm-beige': '#F5F0E8',
        'nav-beige': '#FDFBF7',
        carbon: '#4A4A4A',
        'carbon-light': '#4A4A4A',
        error: '#ba1a1a',
      },
      fontFamily: {
        headline: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
      },
    },
  },
  plugins: [],
};

export default config;
