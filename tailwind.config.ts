import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Figma design tokens
        brand: {
          pink:     "#ffd7ef",
          "pink-dark": "#f5c8e4",
          teal:     "#95dbda",
          "teal-dark": "#8cb4b9",
          yellow:   "#fee74e",
          green:    "#75fc96",
        },
        // Semantic
        background: "#f6f6f6",
        surface:    "#ffffff",
        text: {
          DEFAULT: "#0d0d12",
          sub:     "#666d80",
          muted:   "#5b5a64",
        },
        border: "#e8e8e8",
      },
      fontFamily: {
        manrope: ["var(--font-manrope)", "system-ui", "sans-serif"],
        outfit:  ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "15px",
        pill: "9999px",
        tag:  "29px",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.06)",
        nav:  "0 2px 24px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
