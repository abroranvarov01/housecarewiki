import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F7F4EE",
          light: "#FBF9F5",
          warm: "#F1ECE1",
          card: "#FFFFFF",
          border: "#E6DFD3",
        },
        forest: {
          DEFAULT: "#1E3A2F",
          dark: "#152921",
          light: "#2B5243",
          muted: "#3C6353",
          pale: "#E6EFEA",
        },
        coral: {
          DEFAULT: "#E26D42",
          hover: "#CC5B31",
          light: "#FCECE6",
        },
        mist: {
          DEFAULT: "#DCE5DF",
          light: "#EDF2EE",
          dark: "#B8C7BD",
        },
        ink: {
          DEFAULT: "#1F2924",
          secondary: "#4A5550",
          muted: "#6E7A74",
        },
        sun: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
        prime: {
          DEFAULT: "#00A8E1",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(31, 41, 36, 0.06), 0 2px 6px -1px rgba(31, 41, 36, 0.04)",
        card: "0 2px 12px rgba(31, 41, 36, 0.05)",
        elevated: "0 12px 32px -4px rgba(30, 58, 47, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
