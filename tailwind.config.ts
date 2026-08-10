import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tif: {
          navy: "#0A2342",
          navyDark: "#051329",
          navyLight: "#163866",
          gold: "#C8A24A",
          goldLight: "#DFBA61",
          goldDark: "#A38032",
          silver: "#E2E8F0",
          slate: "#0F172A",
          bgLight: "#f5f5f5",
        },
        primary: {
          DEFAULT: "#0A2342",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#C8A24A",
          foreground: "#0A2342",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-cinzel)", "Cinzel", "serif"],
      },
      boxShadow: {
        luxury: "0 20px 40px -15px rgba(10, 35, 66, 0.15)",
        gold: "0 10px 25px -5px rgba(200, 162, 74, 0.3)",
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
