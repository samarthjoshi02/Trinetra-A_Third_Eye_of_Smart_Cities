/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#04040f",
          card: "rgba(8, 8, 28, 0.65)",
          border: "rgba(0, 242, 254, 0.15)",
          borderHover: "rgba(0, 242, 254, 0.35)",
          cyan: "#00f2fe",
          blue: "#4facfe",
          red: "#ff2a5f",
          green: "#00ff87",
          gold: "#f5a623"
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      boxShadow: {
        cyber: "0 0 15px rgba(0, 242, 254, 0.2)",
        cyberGlow: "0 0 25px rgba(0, 242, 254, 0.45)",
        redGlow: "0 0 20px rgba(255, 42, 95, 0.45)",
        greenGlow: "0 0 20px rgba(0, 255, 135, 0.45)",
        goldGlow: "0 0 20px rgba(245, 166, 35, 0.45)"
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowCyan: {
          '0%': { boxShadow: '0 0 5px rgba(0, 242, 254, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 242, 254, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
