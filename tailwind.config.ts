import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f6fe",
          100: "#dbe8fc",
          200: "#bfd7fa",
          300: "#93bdf6",
          400: "#609df0",
          500: "#3b82e6",
          600: "#1d63d8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554",
          950: "#0f172a",
        },
        status: {
          high: "#ef4444",
          warning: "#f59e0b",
          normal: "#10b981",
        }
      },
    },
  },
  plugins: [],
};
export default config;
