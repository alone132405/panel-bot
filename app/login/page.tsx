'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff, LogIn, Shield, Zap, Terminal } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                if (result.error.includes('PENDING')) {
                    toast.error('Your account is pending approval. Please wait for admin confirmation.')
                } else if (result.error.includes('REJECTED')) {
                    toast.error('Your account has been rejected. Please contact support.')
                } else {
                    toast.error('Invalid email or password')
                }
            } else {
                toast.success('Welcome back!')
                router.push('/dashboard')
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    const featurePills = [
        { icon: Terminal, text: "High-Performance Control Center", color: "text-accent-1", bg: "bg-accent-1/10", border: "border-accent-1/20" },
        { icon: Shield, text: "Enterprise-Grade Protocol", color: "text-accent-2", bg: "bg-accent-2/10", border: "border-accent-2/20" },
        { icon: Zap, text: "Real-Time Telemetry & Sync", color: "text-accent-3", bg: "bg-accent-3/10", border: "border-accent-3/20" }
    ]

    return (
        <div className="min-h-screen flex bg-bg-base relative overflow-hidden">
            {/* Global Animated Mesh Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-1/5 mix-blend-screen filter blur-[100px] animate-blob" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-2/5 mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
            </div>

            {/* Left Side - Animated Visual (55%) */}
            <div className="hidden lg:flex w-[55%] relative z-10 flex-col items-center justify-center p-12 border-r border-border bg-[#05050A]">
                <div className="w-full max-w-lg space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center text-center space-y-6"
                    >
                        {/* Logo with pulsing ring */}
                        <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                            <div className="absolute inset-0 rounded-full border-2 border-accent-1 opacity-20 animate-ping shadow-[0_0_40px_rgba(0,255,178,0.3)]"></div>
                            <div className="absolute inset-2 rounded-full border border-accent-2 opacity-30 animate-pulse"></div>
                            <Image src="/logo.png" alt="Konoha Logo" width={120} height={120} className="object-contain drop-shadow-[0_0_15px_rgba(0,255,178,0.5)] z-10" />
                        </div>
                        
                        <div>
                            <h1 className="font-orbitron text-5xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent-1 to-accent-2 mb-4 leading-tight">
                                KONOHA BAZAAR
                            </h1>
                            <p className="font-sans text-text-muted text-lg max-w-md mx-auto">
                                The ultimate automated protocol framework. Orchestrate your network with absolute precision.
                            </p>
                        </div>
                    </motion.div>

                    {/* Floating Feature Pills */}
                    <div className="space-y-4 pt-8">
                        {featurePills.map((pill, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + (idx * 0.15), duration: 0.6 }}
                                className={`flex items-center gap-4 p-4 rounded-2xl ${pill.bg} border ${pill.border} backdrop-blur-sm transform hover:translate-x-2 transition-transform duration-300`}
                            >
                                <div className={`w-10 h-10 rounded-xl bg-bg-surface border border-border flex items-center justify-center ${pill.color} shadow-glow-violet`}>
                                    <pill.icon className="w-5 h-5" />
                                </div>
                                <span className="font-sans font-bold text-text-primary">{pill.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form (45%) */}
            <div className="w-full lg:w-[45%] flex flex-col items-center justify-center relative z-10 p-6 sm:p-12">
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-bg-surface border border-border rounded-[24px] p-8 shadow-[0_0_50px_rgba(123,94,255,0.05)]">
                        {/* Mobile Logo Only */}
                        <div className="lg:hidden flex flex-col items-center mb-8">
                            <Image src="/logo.png" alt="Konoha Logo" width={80} height={80} className="object-contain drop-shadow-[0_0_15px_rgba(0,255,178,0.5)] mb-4" />
                            <h2 className="font-orbitron text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent-1 to-accent-2">
                                KONOHA BAZAAR
                            </h2>
                        </div>

                        <div className="mb-8">
                            <h2 className="font-orbitron text-3xl font-bold text-text-primary mb-2">ACCESS TERMINAL</h2>
                            <p className="font-sans text-text-muted">Enter credentials to authenticate.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Floating Label Input - Email */}
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-1 transition-colors z-10" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="peer w-full h-14 pl-12 pr-4 bg-bg-elevated border border-border rounded-[12px] text-text-primary placeholder-transparent focus:outline-none focus:border-accent-1 focus:shadow-[0_0_15px_rgba(0,255,178,0.15)] transition-all pt-2"
                                    placeholder="Email Address"
                                    required
                                />
                                <label 
                                    htmlFor="email"
                                    className="absolute left-12 top-1/2 -translate-y-1/2 text-text-muted text-[14px] font-sans transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-[11px] peer-focus:text-accent-1 peer-focus:bg-bg-surface peer-focus:px-2 peer-valid:-top-2 peer-valid:left-4 peer-valid:text-[11px] peer-valid:text-accent-1 peer-valid:bg-bg-surface peer-valid:px-2 pointer-events-none rounded-full"
                                >
                                    Email Address
                                </label>
                            </div>

                            {/* Floating Label Input - Password */}
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-1 transition-colors z-10" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="peer w-full h-14 pl-12 pr-12 bg-bg-elevated border border-border rounded-[12px] text-text-primary placeholder-transparent focus:outline-none focus:border-accent-1 focus:shadow-[0_0_15px_rgba(0,255,178,0.15)] transition-all pt-2"
                                    placeholder="Password"
                                    required
                                />
                                <label 
                                    htmlFor="password"
                                    className="absolute left-12 top-1/2 -translate-y-1/2 text-text-muted text-[14px] font-sans transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-[11px] peer-focus:text-accent-1 peer-focus:bg-bg-surface peer-focus:px-2 peer-valid:-top-2 peer-valid:left-4 peer-valid:text-[11px] peer-valid:text-accent-1 peer-valid:bg-bg-surface peer-valid:px-2 pointer-events-none rounded-full"
                                >
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent-1 transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-gradient-to-r from-accent-1 to-accent-2 text-[#07070E] font-orbitron font-bold text-[16px] rounded-[12px] flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-[0_0_25px_rgba(0,255,178,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-[#07070E]/30 border-t-[#07070E] rounded-full animate-spin" />
                                        AUTHENTICATING...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        INITIALIZE SESSION
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-border text-center">
                            <p className="font-sans text-text-muted text-[14px]">
                                Authorization required. <Link href="/signup" className="text-accent-1 font-bold hover:brightness-125 transition-all">Request Access</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="absolute bottom-6 font-mono text-[11px] text-text-muted/50 tracking-widest uppercase">
                    SYS.V.2.4.1 // SECURE PROTOCOL
                </div>
            </div>
        </div>
    )
}
