import type { Config } from "tailwindcss";

// "Warm Editorial Home Guide" design tokens (see docs/design-system.md).
// Warm cream paper, soft charcoal ink, terracotta for small accents, honey yellow for the highlight,
// leaf green used sparingly for "safe / compatible". Every *-deep shade exists so text passes WCAG 2.2 AA on cream:
// terracotta (#BC7254) and leaf (#6FAE5C) themselves are decoration only (dots, rules, borders), never text.
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
          DEFAULT: "#F8F4EB",
          light: "#FCFAF5",
          warm: "#F1EADC",
          deep: "#EAE0CD",
          card: "#FFFDF8",
          border: "#E4DACA",
        },
        rule: {
          DEFAULT: "#E4DACA",
          strong: "#C8B99F",
          // Form-control outline: 3:1 against cream and card (WCAG 1.4.11).
          field: "#8C8170",
        },
        ink: {
          DEFAULT: "#29322C",
          deep: "#1E2520",
          secondary: "#414A43",
          muted: "#5B635C",
        },
        terracotta: {
          DEFAULT: "#BC7254",
          deep: "#9A4E30",
          soft: "#F6E4DA",
        },
        honey: {
          DEFAULT: "#EFCB77",
          deep: "#E0B456",
          soft: "#FAEFD2",
        },
        // Fresh leaf green (replaced the muted sage): "safe / compatible", field notes, success states.
        leaf: {
          DEFAULT: "#6FAE5C",
          deep: "#2D7139",
          soft: "#E8F2E1",
        },
        // Logo colors (docs/brand/logo-sheet.webp). For the logo, icons and brand surfaces only;
        // UI text and controls keep the AA-checked tokens above.
        brand: {
          forest: "#285E3E",
          terracotta: "#C75E3D",
          honey: "#F6C343",
          cream: "#F8F4EB",
          leaf: "#6FAE5C",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        hand: ["var(--font-hand)", "Bradley Hand", "cursive"],
      },
      // Soft, friendly corners: cards 12-16px, controls 8px, chips and buttons fully rounded.
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      // Light, warm-tinted depth for cards; deeper shadows only for floating layers (menus, sticky bars).
      boxShadow: {
        soft: "0 1px 2px rgba(41, 50, 44, 0.05)",
        card: "0 1px 2px rgba(41, 50, 44, 0.04), 0 8px 24px -16px rgba(74, 52, 30, 0.18)",
        elevated: "0 18px 40px -18px rgba(41, 50, 44, 0.3)",
        float: "0 12px 32px -12px rgba(41, 50, 44, 0.25)",
      },
      maxWidth: {
        page: "76rem",
        prose: "40rem",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
