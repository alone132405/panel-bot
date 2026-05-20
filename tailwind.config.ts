import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    base: 'var(--bg-base)',
                    surface: 'var(--bg-surface)',
                    elevated: 'var(--bg-elevated)',
                    inset: 'var(--bg-inset)',
                },
                background: {
                    primary: 'var(--bg-base)',
                    secondary: 'var(--bg-surface)',
                    tertiary: 'var(--bg-elevated)',
                },
                surface: {
                    DEFAULT: 'var(--bg-surface)',
                    hover: 'var(--surface-hover)',
                },
                primary: {
                    300: '#b5c0ff',
                    400: '#9aa7ff',
                    500: '#7c5cff',
                    600: '#6246ef',
                    700: '#4f35c7',
                },
                accent: {
                    1: 'var(--accent-1)',
                    2: 'var(--accent-2)',
                    3: 'var(--accent-3)',
                    gold: 'var(--accent-gold)',
                    cyan: 'var(--accent-cyan)',
                    emerald: 'var(--accent-1)',
                    rose: 'var(--accent-3)',
                    purple: 'var(--accent-2)',
                },
                text: {
                    primary: 'var(--text-primary)',
                    muted: 'var(--text-muted)',
                    soft: 'var(--text-soft)',
                },
                border: 'var(--border)',
            },
            fontFamily: {
                sans: ['var(--font-dm-sans)', 'Inter', 'sans-serif'],
                orbitron: ['var(--font-orbitron)', 'sans-serif'],
                mono: ['var(--font-jetbrains)', 'monospace'],
            },
            boxShadow: {
                panel: 'var(--shadow-panel)',
                'glow-mint': 'var(--glow-mint)',
                'glow-violet': 'var(--glow-violet)',
                'glow-red': '0 0 24px rgba(255,77,109,0.25)',
                'glow-gold': '0 0 24px rgba(255,189,74,0.24)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, var(--accent-1), var(--accent-cyan))',
                'mesh-gradient': 'linear-gradient(135deg, rgba(33,243,177,0.08), rgba(124,92,255,0.12), rgba(255,189,74,0.06))',
                'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
            },
            keyframes: {
                'pulse-slow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.42' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                scanSweep: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '12%': { opacity: '1' },
                    '80%': { opacity: '1' },
                    '100%': { transform: 'translateY(680px)', opacity: '0' },
                },
            },
            animation: {
                'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4,0,0.6,1) infinite',
                float: 'float 3.5s ease-in-out infinite',
                'float-slow': 'float 5s ease-in-out infinite',
                scan: 'scanSweep 5s linear infinite',
            },
        },
    },
    plugins: [],
}

export default config
