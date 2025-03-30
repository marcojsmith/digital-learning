/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: "#2a9d8f",
        "primary-dark": "#264653",
        secondary: "#e9c46a",
        "light-gray": "#f8f9fa",
        "medium-gray": "#dee2e6",
        "dark-gray": "#495057",
        "user-msg": "#e0f2fe",
        "ai-msg": "#f1f3f5",
        warning: "#fff3cd",
        "warning-border": "#ffeeba",
        "warning-text": "#856404",
        success: "#d1e7dd",
        "success-border": "#c3e6cb",
        "success-text": "#155724",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        DEFAULT: "8px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.05)",
        md: "0 4px 10px rgba(0,0,0,0.07)",
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

