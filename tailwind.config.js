/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./404.html", "./src/**/*.js"],
  theme: {
    extend: {
      colors: {
        ivory: "#fafaf7",
        "ivory-dark": "#f4f1ec",
        stone: "#e8e3dc",
        warm: "#d4c9b8",
        gold: "#765a2d",
        "gold-light": "#d4ae78",
        ink: "#1c1a18",
        "ink-soft": "#3d3830",
        muted: "#665f57",
        "muted-light": "#cac3ba",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
