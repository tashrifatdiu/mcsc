// Updated tailwind.config.js (extend theme with custom gray colors based on suggestions)
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          'primary': '#F2F2F2', // Very light gray for main bg
          'secondary': '#D3D3D3', // Light gray for cards/sections
          'accent': '#C4C4C4', // Mid-tone light gray for accents/borders
          'text': '#696969', // Dim gray for body text
          'headline': '#2D2D2D', // Near-black gray for headlines
          'border': '#A9A9A9', // Medium gray for borders
          'shadow': '#878787', // Cooler darker gray for shadows (used in rgba)
          'deep': '#5A5A5A', // Medium-dark for subtle elements
          'charcoal': '#36454F', // Charcoal for nav/deep elements
          'slate': '#778899', // Light slate with blue undertone for highlights
        }
      },
      boxShadow: {
        'news': '0 4px 6px -1px rgba(135, 135, 135, 0.1), 0 2px 4px -1px rgba(135, 135, 135, 0.06)', // Custom shadow with gray
        'news-lg': '0 10px 15px -3px rgba(135, 135, 135, 0.1), 0 4px 6px -2px rgba(135, 135, 135, 0.05)',
      }
    },
  },
  plugins: [],
}