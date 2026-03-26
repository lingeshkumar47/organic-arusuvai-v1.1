/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand Base (Deep Green)
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0', // Light green glow
          300: '#6ee7b7', // Accents
          400: '#34d399',
          500: '#10b981',
          600: '#059669', // Base Core Primary
          700: '#047857',
          800: '#065f46',
          900: '#064e3b', // Deep green text/bg
          950: '#022c22', // Extreme dark green for headers/admin
        },
        // Call to Action (Mustard Yellow)
        cta: {
          50: '#fefce8',
          100: '#fef08a',
          200: '#fde047',
          300: '#facc15', // Highlight Yellow
          400: '#eab308', // CTA Primary Button
          500: '#ca8a04', // CTA Hover/Deep
          600: '#a16207',
          700: '#854d0e',
          800: '#713f12',
          900: '#3f2108',
        },
        // Admin / Professional Dashboard palette
        admin: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617', // Pure dark
        }
      },
      fontFamily: {
        // Apple-style typography
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"SF Pro Display"', '"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px 0px rgba(16, 185, 129, 0.2)', // primary glow
        'glow-cta': '0 0 20px 0px rgba(234, 179, 8, 0.3)', // mustard glow
        'ios': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'nav': '0 1px 0 0 rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.03)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem', // Excessive rounding for premium Apple vibe
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-gentle': 'pulseGentle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
