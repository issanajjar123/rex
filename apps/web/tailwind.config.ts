import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
                extend: {
                    colors: {
                        dark: {
                            900: '#0B0F19',
                            800: '#111623',
                            700: '#1A2133',
                        },
                        accent: {
                            500: '#6366F1',
                            400: '#818CF8',
                            glow: 'rgba(99, 102, 241, 0.5)'
                        }
                    },
                    fontFamily: {
                        sans: ['General Sans', 'sans-serif'],
                        display: ['Outfit', 'sans-serif'],
                    },
                    backgroundImage: {
                        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                        'glass': 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                        'glass-dark': 'linear-gradient(180deg, rgba(17, 22, 35, 0.7) 0%, rgba(11, 15, 25, 0.9) 100%)',
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.6s ease-out forwards',
                        'slide-up': 'slideUp 0.5s ease-out forwards',
                        'pulse-glow': 'pulseGlow 3s infinite',
                    },
                    keyframes: {
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' },
                        },
                        slideUp: {
                            '0%': { transform: 'translateY(20px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' },
                        },
                        pulseGlow: {
                            '0%, 100%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)' },
                            '50%': { boxShadow: '0 0 25px rgba(99, 102, 241, 0.3)' },
                        }
                    }
                }
            },
  plugins: [],
};
export default config;
