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
        background: "#FAF9F5",
        surface: "#FFFFFF",
        "surface-muted": "#F3F4ED",
        "surface-accent": "#EAF5EE",
        border: "#E2E8E2",
        primary: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
          950: "#052E16",
        },
        forest: {
          DEFAULT: "#0F2E1B",
          deep: "#091D11",
          text: "#12281B",
          muted: "#4F6857",
          subtle: "#809988",
        },
        lime: {
          accent: "#84CC16",
          bright: "#A3E635",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(15, 46, 27, 0.05), 0 2px 6px -1px rgba(15, 46, 27, 0.03)",
        "soft-md": "0 10px 30px -4px rgba(15, 46, 27, 0.07), 0 4px 12px -2px rgba(15, 46, 27, 0.04)",
        "soft-lg": "0 20px 40px -6px rgba(15, 46, 27, 0.1), 0 8px 20px -4px rgba(15, 46, 27, 0.05)",
        pill: "0 2px 10px rgba(15, 46, 27, 0.06)",
        float: "0 12px 35px -5px rgba(22, 163, 74, 0.18)",
      },
      animation: {
        "gentle-float": "float 4s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
