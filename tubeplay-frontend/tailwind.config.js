/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: { fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] }, colors: { brand: { 400: "#ff6b6b", 500: "#f04444", 600: "#dc2626" } }, boxShadow: { soft: "0 12px 40px rgba(0,0,0,.12)" } } },
  plugins: []
};