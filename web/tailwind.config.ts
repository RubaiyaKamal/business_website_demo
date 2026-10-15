import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E8E3E",
          foreground: "#FFFFFF",
          50: "#EEF7F0",
          100: "#D6ECDC",
          600: "#1E8E3E",
          700: "#176C30",
        },
        dark: {
          DEFAULT: "#0B3D2E",
          foreground: "#F4FAF6",
        },
        accent: {
          DEFAULT: "#FF8A00",
          foreground: "#1A1A1A",
          50: "#FFF4E6",
          100: "#FFE7C7",
          600: "#E67A00",
        },
        surface: "#F4FAF6",
        ink: "#1A1A1A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        urdu: ["var(--font-urdu)", "var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,61,46,0.06), 0 8px 24px rgba(11,61,46,0.06)",
        "card-hover": "0 4px 12px rgba(11,61,46,0.10), 0 16px 40px rgba(11,61,46,0.10)",
      },
      maxWidth: {
        content: "72rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
