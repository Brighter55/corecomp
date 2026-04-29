/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
        sans: ["Segoe UI", "Arial", "sans-serif"],
    },
    extend: {
      fontFamily: {
        display: ["Montserrat", "Segoe UI", "Arial", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out",
      },
    },
  },
  plugins: [],
};
