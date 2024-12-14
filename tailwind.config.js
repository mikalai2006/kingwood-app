/** @type {import('tailwindcss').Config} */

import { Colors } from "./src/utils/colors";

export default {
  darkMode: "class",
  important: true,
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./electron/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: Colors,
    },
  },
  plugins: [],
};
