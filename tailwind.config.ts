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
        brand: {
          50: "#fdf5ea",
          100: "#faead2",
          200: "#f4d19e",
          300: "#eeb16a",
          400: "#e48f3b",
          500: "#d4741e",
          600: "#b85c16",
          700: "#944517",
          800: "#753719",
          900: "#5f2f18",
        },
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "system-ui", "sans-serif"],
        display: ["var(--font-cairo)", "var(--font-tajawal)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
