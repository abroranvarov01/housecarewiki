import type { Config } from "tailwindcss";

// "Warm Editorial Home Guide" design tokens, "Peach & Teal" palette, Nov 2026 (see docs/design-system.md).
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
        // "Peach & Teal" palette (Nov 2026): warm cream paper, deep teal (water, clean) as the main colour,
        // peach for the answer highlight, coral for small accents. Every *-deep shade passes AA as text on cream.
        paper: {
          DEFAULT: "#FBF4EC",
          light: "#FEFAF5",
          warm: "#F6EADF",
          deep: "#EEDDCD",
          card: "#FFFDF9",
          border: "#EADDD0",
        },
        rule: {
          DEFAULT: "#EADDD0",
          strong: "#D2BFAD",
          // Form-control outline: >= 3:1 against cream and card (WCAG 1.4.11).
          field: "#8F7E70",
        },
        ink: {
          DEFAULT: "#1E2B2B",
          deep: "#132020",
          secondary: "#3A4747",
          muted: "#56605F",
        },
        // Coral: small accents (strokes, dots), warnings. Text and links use `coral-deep` (5.5:1 on cream).
        coral: {
          DEFAULT: "#D9654B",
          deep: "#A9432C",
          soft: "#FBE3DA",
        },
        // Peach: the answer highlight, "short answer" cards, chips. Background for ink text only.
        peach: {
          DEFAULT: "#F6B996",
          deep: "#EE9E74",
          soft: "#FDE7DA",
          // Peach as small text on teal bands (5:1); plain peach is 4.5:1 there and fails AA for small caps.
          light: "#F8C6A8",
        },
        // Deep teal: primary buttons, footer and tool bands. Cream text on teal is 7.2:1.
        teal: {
          DEFAULT: "#1F5C5B",
          deep: "#154443",
          soft: "#DCEDEC",
        },
        // Leaf green, used sparingly: "safe to DIY", field notes, success states. Text uses leaf-deep.
        leaf: {
          DEFAULT: "#6FAE5C",
          deep: "#2D7139",
          soft: "#E8F2E1",
        },
        // Logo colours: for the logo, icons and brand surfaces only.
        brand: {
          teal: "#1F5C5B",
          coral: "#D9654B",
          peach: "#F6B996",
          cream: "#FBF4EC",
          leaf: "#6FAE5C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
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
