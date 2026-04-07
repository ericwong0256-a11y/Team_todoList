import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      colors: {
        surface: "#0f172a",
        panel: "#111827"
      },
      boxShadow: {
        glow: "0 0 80px -20px rgba(34, 211, 238, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
