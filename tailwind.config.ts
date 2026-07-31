import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a66c2',
          hover: '#004182',
          light: '#e8f2ff',
        },
        accent: {
          DEFAULT: '#057642',
          hover: '#045d34',
          light: '#e6f4ea',
        },
        dark: {
          DEFAULT: '#1d2226',
          secondary: '#293138',
          light: '#5e6e82',
        },
      },
    },
  },
  plugins: [],
};

export default config;
