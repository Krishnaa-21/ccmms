/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Navy / Institutional University Primary
        primary: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3daec',
          300: '#94bfde',
          400: '#5e9dcc',
          500: '#387eb8',
          600: '#27649b',
          700: '#20507d',
          800: '#1b4369',
          900: '#0f2942',
          950: '#091a2b',
        },
        // Refined Accent Teal
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Campus Neutral Warm Slate
        surface: {
          50: 'var(--color-surface-50)',
          100: 'var(--color-surface-100)',
          200: 'var(--color-surface-200)',
          card: 'var(--color-surface-card)',
          elevated: 'var(--color-surface-elevated)',
          border: 'var(--color-border)',
          'border-subtle': 'var(--color-border-subtle)',
        },
        // Semantic complaint status colors
        status: {
          submitted: {
            bg: 'var(--status-submitted-bg)',
            text: 'var(--status-submitted-text)',
            border: 'var(--status-submitted-border)',
            dot: 'var(--status-submitted-dot)',
          },
          review: {
            bg: 'var(--status-review-bg)',
            text: 'var(--status-review-text)',
            border: 'var(--status-review-border)',
            dot: 'var(--status-review-dot)',
          },
          assigned: {
            bg: 'var(--status-assigned-bg)',
            text: 'var(--status-assigned-text)',
            border: 'var(--status-assigned-border)',
            dot: 'var(--status-assigned-dot)',
          },
          progress: {
            bg: 'var(--status-progress-bg)',
            text: 'var(--status-progress-text)',
            border: 'var(--status-progress-border)',
            dot: 'var(--status-progress-dot)',
          },
          parts: {
            bg: 'var(--status-parts-bg)',
            text: 'var(--status-parts-text)',
            border: 'var(--status-parts-border)',
            dot: 'var(--status-parts-dot)',
          },
          resolved: {
            bg: 'var(--status-resolved-bg)',
            text: 'var(--status-resolved-text)',
            border: 'var(--status-resolved-border)',
            dot: 'var(--status-resolved-dot)',
          },
          closed: {
            bg: 'var(--status-closed-bg)',
            text: 'var(--status-closed-text)',
            border: 'var(--status-closed-border)',
            dot: 'var(--status-closed-dot)',
          },
          rejected: {
            bg: 'var(--status-rejected-bg)',
            text: 'var(--status-rejected-text)',
            border: 'var(--status-rejected-border)',
            dot: 'var(--status-rejected-dot)',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
        'popover': '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
        'elevated': '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
        'card-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
};
