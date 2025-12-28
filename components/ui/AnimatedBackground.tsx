'use client'

import { motion } from 'framer-motion'

export default function AnimatedBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Deep Dark Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background-primary via-background-secondary to-background-tertiary" />

            {/* Mesh Gradient Overlay */}
            <div className="absolute inset-0 bg-mesh-gradient opacity-50" />

            {/* Animated Orbs - Indigo Theme */}
            <motion.div
                className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl"
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl"
                animate={{
                    x: [0, -100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl"
                animate={{
                    x: [-50, 50, -50],
                    y: [-50, 50, -50],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* Radial Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background-primary/80" />
        </div>
    )
}
