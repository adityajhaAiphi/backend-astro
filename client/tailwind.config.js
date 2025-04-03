/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
        // Hindu mythology inspired colors
        saffron: {
          100: "hsl(var(--saffron-100))",
          200: "hsl(var(--saffron-200))",
          300: "hsl(var(--saffron-300))",
          400: "hsl(var(--saffron-400))",
          500: "hsl(var(--saffron-500))", // Sacred Saffron
          600: "hsl(var(--saffron-600))",
          700: "hsl(var(--saffron-700))",
          800: "hsl(var(--saffron-800))",
          900: "hsl(var(--saffron-900))"
        },
        kumkum: {
          50: "hsl(var(--kumkum-50))",
          100: "hsl(var(--kumkum-100))",
          200: "hsl(var(--kumkum-200))",
          300: "hsl(var(--kumkum-300))",
          400: "hsl(var(--kumkum-400))",
          500: "hsl(var(--kumkum-500))",
          600: "hsl(var(--kumkum-600))",
          700: "hsl(var(--kumkum-700))",
          800: "hsl(var(--kumkum-800))",
          900: "hsl(var(--kumkum-900))"
        },
        sacred: {
          gold: "hsl(var(--sacred-gold))",
          copper: "hsl(var(--sacred-copper))",
          saffron: "hsl(var(--sacred-saffron))",
          sandal: "hsl(var(--sacred-sandal))",
          vermilion: "hsl(var(--sacred-vermilion))"
        },
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "meteor-effect": "meteor 5s linear infinite",
        'spin-slow': 'spin 20s linear infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'divine-spin': 'divine-spin 20s linear infinite',
        'scroll': 'scroll 20s linear infinite',
        'shine': 'shine 8s linear infinite',
        'sacred-shimmer': 'sacred-shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: 1 },
          "70%": { opacity: 1 },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: 0,
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        'divine-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scroll: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        shine: {
          '0%': { left: '-100%' },
          '50%, 100%': { left: '100%' }
        },
        'sacred-shimmer': {
          '0%': { backgroundPosition: '200% 50%' },
          '100%': { backgroundPosition: '-200% 50%' },
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: false, // Remove themes to use custom CSS
    base: true,
    styled: true,
    utils: true,
  }
}
