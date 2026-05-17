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
                    base:     'var(--bg-base)',
                    surface:  'var(--bg-surface)',
                    elevated: 'var(--bg-elevated)',
                },
                accent: {
                    1:    'var(--accent-1)',
                    2:    'var(--accent-2)',
                    3:    'var(--accent-3)',
                    gold: 'var(--accent-gold)',
                },
                text: {
                    primary: 'var(--text-primary)',
                    muted:   'var(--text-muted)',
                },
                border: 'var(--border)',
            },
            fontFamily: {
                sans:     ['var(--font-dm-sans)', 'sans-serif'],
                orbitron: ['var(--font-orbitron)', 'sans-serif'],
                mono:     ['var(--font-jetbrains)', 'monospace'],
            },
            boxShadow: {
                'glow-mint':   'var(--glow-mint)',
                'glow-violet': 'var(--glow-violet)',
                'glow-red':    '0 0 20px rgba(255,77,109,0.35)',
                'glow-gold':   '0 0 20px rgba(255,184,0,0.3)',
            },
            keyframes: {
                'pulse-slow': {
                    '0%, 100%': { opacity: '1' },
                    '50%':      { opacity: '0.4' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%':      { transform: 'translateY(-8px)' },
                },
                blob: {
                    '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
                    '50%':      { transform: 'translate3d(4%,4%,0) scale(1.08)' },
                },
                scanSweep: {
                    '0%':   { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(500px)' },
                },
            },
            animation: {
                'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4,0,0.6,1) infinite',
                'float':      'float 3s ease-in-out infinite',
                'float-slow': 'float 4.5s ease-in-out infinite',
                'blob':       'blob 12s ease-in-out infinite alternate',
                'scan':       'scanSweep 4s linear infinite',
            },
        },
    },
    plugins: [],
}

export default config
