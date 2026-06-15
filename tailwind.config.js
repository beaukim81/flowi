/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "Nunito", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        navy: "#18245b",
        lavender: "#8a6df1",
        lilac: "#c8b8ff",
        mint: "#68bea1",
        sky: "#91ccec",
        honey: "#ffc65b",
        coral: "#ff8d70",
        cream: "#fbf9ff"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(71, 63, 137, 0.12)",
        card: "0 10px 24px rgba(65, 69, 123, 0.10)"
      }
    }
  },
  plugins: []
};
