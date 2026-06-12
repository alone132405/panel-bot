'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Phone, MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contactType: '' as '' | 'WHATSAPP' | 'LINE' | 'TELEGRAM',
        contactValue: '',
        countryCode: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const nextStep = () => {
        if (step === 1 && (!formData.name || !formData.email)) {
            toast.error('Please fill all fields')
            return
        }
        if (step === 2) {
            if (!formData.password || !formData.confirmPassword) {
                toast.error('Please enter a password')
                return
            }
            if (formData.password !== formData.confirmPassword) {
                toast.error("Passwords don't match")
                return
            }
        }
        setStep(prev => Math.min(prev + 1, 3))
    }

    const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

    const hasValidContact = () => {
        if (!formData.contactType) {
            toast.error('Please select a contact method')
            return false
        }

        if (formData.contactType === 'WHATSAPP') {
            if (!formData.countryCode.trim() || !formData.contactValue.trim()) {
                toast.error('Please enter your WhatsApp country code and number')
                return false
            }
            return true
        }

        if (!formData.contactValue.trim()) {
            toast.error('Please enter your contact information')
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (step !== 3) {
            nextStep()
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match")
            return
        }

        if (!hasValidContact()) {
            return
        }

        setIsLoading(true)

        try {
            let contactValue = formData.contactValue.trim()
            if (formData.contactType === 'WHATSAPP' && formData.countryCode && formData.contactValue) {
                contactValue = `+${formData.countryCode}${formData.contactValue}`
            }

            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                    contactType: formData.contactType,
                    contactValue: contactValue,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || 'Failed to create account')
                return
            }

            toast.success('Account created! Please wait for admin approval before logging in.')
            router.push('/login')
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' }
        if (password.length < 8) return { strength: 25, label: 'Weak', color: 'bg-[#FF4D6D] shadow-glow-red' }
        if (password.length < 12) return { strength: 50, label: 'Fair', color: 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' }
        if (password.length < 16) return { strength: 75, label: 'Good', color: 'bg-[#0088CC] shadow-[0_0_15px_rgba(0,136,204,0.5)]' }
        return { strength: 100, label: 'Strong', color: 'bg-accent-1 shadow-glow-mint' }
    }

    const passwordStrength = getPasswordStrength(formData.password)

    const stepVariants = {
        hidden: { opacity: 0, x: 40 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: -40, transition: { duration: 0.3 } }
    }

    return (
        <div className="app-frame flex min-h-screen overflow-hidden bg-bg-base">
            <div className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px)] bg-[size:48px_48px]" />
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-accent-1/10 to-transparent" />
            </div>

            <div className="w-full flex flex-col items-center justify-center relative z-10 p-6 sm:p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="panel-solid overflow-hidden rounded-[24px] p-8">
                        
                        {/* Header */}
                        <div className="flex flex-col items-center mb-8">
                            <Image src="/logo.png" alt="Konoha Logo" width={64} height={64} className="mb-4 object-contain drop-shadow-[0_0_15px_rgba(33,243,177,0.38)]" />
                            <h2 className="font-orbitron text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-accent-1 to-accent-2">
                                REQUEST ACCESS
                            </h2>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between text-xs font-sans text-text-muted mb-2">
                                <span className={step >= 1 ? "text-accent-1" : ""}>Account</span>
                                <span className={step >= 2 ? "text-accent-1" : ""}>Security</span>
                                <span className={step >= 3 ? "text-accent-1" : ""}>Contact</span>
                            </div>
                            <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-accent-1 to-accent-2"
                                    initial={{ width: "33%" }}
                                    animate={{ width: `${(step / 3) * 100}%` }}
                                    transition={{ duration: 0.4 }}
                                />
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="relative min-h-[320px]">
                            <AnimatePresence mode="wait">
                                {/* Step 1: Account */}
                                {step === 1 && (
                                    <motion.div 
                                        key="step1" 
                                        variants={stepVariants} 
                                        initial="hidden" 
                                        animate="visible" 
                                        exit="exit"
                                        className="space-y-6 absolute w-full"
                                    >
                                        {/* Floating Label Input - Name */}
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-1 transition-colors z-10" />
                                            <input
                                                type="text"
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="peer h-14 w-full rounded-[24px] border border-border bg-bg-elevated pl-12 pr-4 pt-2 text-text-primary placeholder-transparent transition-all focus:border-accent-1 focus:outline-none focus:shadow-[0_0_15px_rgba(33,243,177,0.15)]"
                                                placeholder="Full Name"
                                                required
                                            />
                                            <label 
                                                htmlFor="name"
                                                className="absolute left-12 top-1/2 -translate-y-1/2 text-text-muted text-[14px] font-sans transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-[11px] peer-focus:text-accent-1 peer-focus:bg-bg-surface peer-focus:px-2 peer-valid:-top-2 peer-valid:left-4 peer-valid:text-[11px] peer-valid:text-accent-1 peer-valid:bg-bg-surface peer-valid:px-2 pointer-events-none rounded-full"
                                            >
                                                Full Name
                                            </label>
                                        </div>

                                        {/* Floating Label Input - Email */}
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-1 transition-colors z-10" />
                                            <input
                                                type="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="peer h-14 w-full rounded-[24px] border border-border bg-bg-elevated pl-12 pr-4 pt-2 text-text-primary placeholder-transparent transition-all focus:border-accent-1 focus:outline-none focus:shadow-[0_0_15px_rgba(33,243,177,0.15)]"
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
                                    </motion.div>
                                )}

                                {/* Step 2: Security */}
                                {step === 2 && (
                                    <motion.div 
                                        key="step2" 
                                        variants={stepVariants} 
                                        initial="hidden" 
                                        animate="visible" 
                                        exit="exit"
                                        className="space-y-6 absolute w-full"
                                    >
                                        {/* Floating Label Input - Password */}
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-1 transition-colors z-10" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="peer h-14 w-full rounded-[24px] border border-border bg-bg-elevated pl-12 pr-12 pt-2 text-text-primary placeholder-transparent transition-all focus:border-accent-1 focus:outline-none focus:shadow-[0_0_15px_rgba(33,243,177,0.15)]"
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
                                            
                                            {/* Password Strength Indicator */}
                                            {formData.password && (
                                                <div className="absolute -bottom-5 w-full space-y-1 left-0">
                                                    <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${passwordStrength.strength}%` }}
                                                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Floating Label Input - Confirm Password */}
                                        <div className="relative group mt-8">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-1 transition-colors z-10" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="peer h-14 w-full rounded-[24px] border border-border bg-bg-elevated pl-12 pr-4 pt-2 text-text-primary placeholder-transparent transition-all focus:border-accent-1 focus:outline-none focus:shadow-[0_0_15px_rgba(33,243,177,0.15)]"
                                                placeholder="Confirm Password"
                                                required
                                            />
                                            <label 
                                                htmlFor="confirmPassword"
                                                className="absolute left-12 top-1/2 -translate-y-1/2 text-text-muted text-[14px] font-sans transition-all peer-focus:-top-2 peer-focus:left-4 peer-focus:text-[11px] peer-focus:text-accent-1 peer-focus:bg-bg-surface peer-focus:px-2 peer-valid:-top-2 peer-valid:left-4 peer-valid:text-[11px] peer-valid:text-accent-1 peer-valid:bg-bg-surface peer-valid:px-2 pointer-events-none rounded-full"
                                            >
                                                Confirm Password
                                            </label>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Contact */}
                                {step === 3 && (
                                    <motion.div 
                                        key="step3" 
                                        variants={stepVariants} 
                                        initial="hidden" 
                                        animate="visible" 
                                        exit="exit"
                                        className="space-y-6 absolute w-full"
                                    >
                                        <div className="space-y-3">
                                            <label className="text-[13px] font-sans text-text-muted uppercase tracking-wider">Contact Method</label>
                                            <div className="flex gap-3">
                                                {/* WhatsApp Chip */}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, contactType: 'WHATSAPP', contactValue: '' })}
                                                    className={`flex-1 py-3 flex flex-col items-center gap-1 rounded-[24px] border transition-all ${formData.contactType === 'WHATSAPP' ? 'bg-gradient-to-b from-[#25D366]/20 to-[#25D366]/10 border-[#25D366]/50 shadow-[0_0_15px_rgba(37,211,102,0.2)]' : 'bg-bg-elevated border-border hover:border-text-muted'}`}
                                                >
                                                    <Phone className={`w-5 h-5 ${formData.contactType === 'WHATSAPP' ? 'text-[#25D366]' : 'text-text-muted'}`} />
                                                    <span className={`text-[11px] font-bold ${formData.contactType === 'WHATSAPP' ? 'text-[#25D366]' : 'text-text-muted'}`}>WhatsApp</span>
                                                </button>
                                                
                                                {/* Line Chip */}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, contactType: 'LINE', contactValue: '' })}
                                                    className={`flex-1 py-3 flex flex-col items-center gap-1 rounded-[24px] border transition-all ${formData.contactType === 'LINE' ? 'bg-gradient-to-b from-[#00C300]/20 to-[#00C300]/10 border-[#00C300]/50 shadow-[0_0_15px_rgba(0,195,0,0.2)]' : 'bg-bg-elevated border-border hover:border-text-muted'}`}
                                                >
                                                    <MessageCircle className={`w-5 h-5 ${formData.contactType === 'LINE' ? 'text-[#00C300]' : 'text-text-muted'}`} />
                                                    <span className={`text-[11px] font-bold ${formData.contactType === 'LINE' ? 'text-[#00C300]' : 'text-text-muted'}`}>Line</span>
                                                </button>

                                                {/* Telegram Chip */}
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, contactType: 'TELEGRAM', contactValue: '' })}
                                                    className={`flex-1 py-3 flex flex-col items-center gap-1 rounded-[24px] border transition-all ${formData.contactType === 'TELEGRAM' ? 'bg-gradient-to-b from-[#0088CC]/20 to-[#0088CC]/10 border-[#0088CC]/50 shadow-[0_0_15px_rgba(0,136,204,0.2)]' : 'bg-bg-elevated border-border hover:border-text-muted'}`}
                                                >
                                                    <MessageCircle className={`w-5 h-5 ${formData.contactType === 'TELEGRAM' ? 'text-[#0088CC]' : 'text-text-muted'}`} />
                                                    <span className={`text-[11px] font-bold ${formData.contactType === 'TELEGRAM' ? 'text-[#0088CC]' : 'text-text-muted'}`}>Telegram</span>
                                                </button>
                                            </div>
                                        </div>

                                        {formData.contactType === 'WHATSAPP' && (
                                            <div className="flex gap-3">
                                                <div className="relative w-24">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">+</span>
                                                    <input
                                                        type="tel"
                                                        value={formData.countryCode}
                                                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value.replace(/\D/g, '') })}
                                                        className="h-14 w-full rounded-[24px] border border-border bg-bg-elevated pl-8 pr-2 text-center text-text-primary transition-all focus:border-[#25D366] focus:outline-none"
                                                        placeholder="91"
                                                        maxLength={4}
                                                    />
                                                </div>
                                                <div className="relative flex-1">
                                                    <input
                                                        type="tel"
                                                        value={formData.contactValue}
                                                        onChange={(e) => setFormData({ ...formData, contactValue: e.target.value.replace(/\D/g, '') })}
                                                        className="h-14 w-full rounded-[24px] border border-border bg-bg-elevated px-4 text-text-primary transition-all focus:border-[#25D366] focus:outline-none"
                                                        placeholder="Phone number"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {formData.contactType === 'LINE' && (
                                            <input
                                                type="text"
                                                value={formData.contactValue}
                                                onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                                                className="h-14 w-full rounded-[24px] border border-border bg-bg-elevated px-4 text-text-primary transition-all focus:border-[#00C300] focus:outline-none"
                                                placeholder="Enter Line ID"
                                            />
                                        )}

                                        {formData.contactType === 'TELEGRAM' && (
                                            <input
                                                type="text"
                                                value={formData.contactValue}
                                                onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                                                className="h-14 w-full rounded-[24px] border border-border bg-bg-elevated px-4 text-text-primary transition-all focus:border-[#0088CC] focus:outline-none"
                                                placeholder="Enter Telegram Handle (e.g. @username)"
                                            />
                                        )}

                                        <p className="text-[12px] text-text-muted">
                                            Contact information is required for approval and account follow-up.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3 mt-8">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex items-center justify-center rounded-[24px] border border-border bg-bg-elevated px-4 py-4 text-text-muted transition-all hover:bg-bg-elevated/80 hover:text-text-primary"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            
                            <button
                                type={step === 3 ? "submit" : "button"}
                                onClick={step === 3 ? handleSubmit : nextStep}
                                disabled={isLoading}
                                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-[24px] bg-gradient-to-r from-accent-1 to-accent-cyan font-orbitron text-[15px] font-bold text-[#031017] transition-all duration-300 hover:brightness-110 hover:shadow-glow-mint disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-[#07070E]/30 border-t-[#07070E] rounded-full animate-spin" />
                                        PROCESSING...
                                    </>
                                ) : step === 3 ? (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        SUBMIT REQUEST
                                    </>
                                ) : (
                                    <>
                                        CONTINUE
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border text-center">
                            <p className="font-sans text-text-muted text-[14px]">
                                Already have access? <Link href="/login" className="text-accent-1 font-bold hover:brightness-125 transition-all">Sign In</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
                
                <div className="absolute bottom-6 font-sans text-[11px] text-text-muted/50 tracking-widest uppercase text-center w-full">
                    Copyright Konoha Bazaar
                </div>
            </div>
        </div>
    )
}
