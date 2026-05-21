'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff, LogIn, Shield, Terminal, Radio } from 'lucide-react'
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
        { icon: Terminal, text: 'Control center', meta: 'Configuration matrix', color: 'text-accent-1', bg: 'bg-accent-1/10', border: 'border-accent-1/20' },
        { icon: Shield, text: 'Protected access', meta: 'Admin approval flow', color: 'text-accent-2', bg: 'bg-accent-2/10', border: 'border-accent-2/20' },
        { icon: Radio, text: 'Manual save', meta: 'Save config, then apply', color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', border: 'border-accent-cyan/20' },
    ]

    return (
        <div className="app-frame flex min-h-screen overflow-hidden bg-bg-base">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:48px_48px]" />
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-accent-cyan/10 to-transparent" />
            </div>

            <div className="relative z-10 hidden w-[55%] flex-col justify-between border-r border-border bg-bg-inset/80 p-10 lg:flex">
                <div className="flex items-center gap-3">
                    <Image src="/logo.png" alt="Konoha Bazaar" width={44} height={44} className="object-contain" />
                    <div>
                        <p className="font-orbitron text-[12px] font-bold uppercase tracking-[0.32em] text-accent-1">Konoha</p>
                        <p className="font-orbitron text-[12px] font-bold uppercase tracking-[0.32em] text-text-primary">Bazaar</p>
                    </div>
                </div>

                <div className="w-full max-w-lg space-y-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center text-center space-y-6"
                    >
                        <div className="relative mb-4 flex h-36 w-36 items-center justify-center">
                            <div className="absolute inset-0 rounded-full border border-accent-1/20" />
                            <div className="absolute inset-4 rounded-full border border-accent-cyan/20" />
                            <Image src="/logo.png" alt="Konoha Logo" width={108} height={108} className="z-10 object-contain drop-shadow-[0_0_15px_rgba(33,243,177,0.38)]" />
                        </div>
                        
                        <div>
                            <h1 className="mb-4 bg-gradient-to-r from-accent-1 to-accent-cyan bg-clip-text font-orbitron text-5xl font-bold uppercase tracking-[0.18em] text-transparent">
                                KONOHA BAZAAR
                            </h1>
                            <p className="mx-auto max-w-md text-lg leading-relaxed text-text-muted">
                                A focused operations console for bot configuration, account access, and exported reports.
                            </p>
                        </div>
                    </motion.div>

                    <div className="space-y-4 pt-8">
                        {featurePills.map((pill, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + (idx * 0.15), duration: 0.6 }}
                                className={`flex items-center gap-4 rounded-lg ${pill.bg} border ${pill.border} p-4 backdrop-blur-sm transition-transform duration-300 hover:translate-x-2`}
                            >
                                <div className={`flex h-10 w-10 items-center justify-center rounded-md border border-border bg-bg-surface ${pill.color}`}>
                                    <pill.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-text-primary">{pill.text}</p>
                                    <p className="text-[12px] text-text-muted">{pill.meta}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                    {['API READY', 'MANUAL SYNC', 'SECURE'].map((item) => (
                        <div key={item} className="rounded-lg border border-border bg-white/[0.03] px-3 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-[45%]">
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="panel-solid rounded-lg p-8">
                        <div className="lg:hidden flex flex-col items-center mb-8">
                            <Image src="/logo.png" alt="Konoha Logo" width={80} height={80} className="mb-4 object-contain drop-shadow-[0_0_15px_rgba(33,243,177,0.38)]" />
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
                                    className="peer h-14 w-full rounded-lg border border-border bg-bg-elevated pl-12 pr-4 pt-2 text-text-primary placeholder-transparent transition-all focus:border-accent-1 focus:outline-none focus:shadow-[0_0_15px_rgba(33,243,177,0.15)]"
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
                                    className="peer h-14 w-full rounded-lg border border-border bg-bg-elevated pl-12 pr-12 pt-2 text-text-primary placeholder-transparent transition-all focus:border-accent-1 focus:outline-none focus:shadow-[0_0_15px_rgba(33,243,177,0.15)]"
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
                                className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-1 to-accent-cyan font-orbitron text-[15px] font-bold text-[#031017] transition-all duration-300 hover:brightness-110 hover:shadow-glow-mint disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
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

                <div className="absolute bottom-6 font-mono text-[11px] uppercase tracking-widest text-text-muted/50">
                    SYS.V.2.4.1 // SECURE
                </div>
            </div>
        </div>
    )
}
