'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Phone, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export default function SignupPage() {
    const router = useRouter()
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match")
            return
        }

        setIsLoading(true)

        try {
            // Combine country code and phone number for WhatsApp
            let contactValue = formData.contactValue || undefined
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
                    contactType: formData.contactType || undefined,
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
        if (password.length < 8) return { strength: 25, label: 'Weak', color: 'bg-red-500' }
        if (password.length < 12) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' }
        if (password.length < 16) return { strength: 75, label: 'Good', color: 'bg-blue-500' }
        return { strength: 100, label: 'Strong', color: 'bg-green-500' }
    }

    const passwordStrength = getPasswordStrength(formData.password)

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <AnimatedBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass-card p-8 space-y-6">
                    {/* Logo and Title */}
                    <div className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto flex items-center justify-center mb-4"
                        >
                            <UserPlus className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Create Account</h1>
                        <p className="text-gray-400">Join us to manage your bots</p>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field w-full pl-11"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field w-full pl-11"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field w-full pl-11 pr-11"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Password strength</span>
                                        <span className={`font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${passwordStrength.strength}%` }}
                                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="input-field w-full pl-11"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Contact Info Section */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Contact Info (Optional)</label>
                            <div className="relative">
                                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={formData.contactType}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        contactType: e.target.value as '' | 'WHATSAPP' | 'LINE' | 'TELEGRAM',
                                        contactValue: '' // Reset value when type changes
                                    })}
                                    className="input-field w-full pl-11 appearance-none cursor-pointer"
                                >
                                    <option value="">Select contact method...</option>
                                    <option value="WHATSAPP">WhatsApp</option>
                                    <option value="LINE">Line App</option>
                                    <option value="TELEGRAM">Telegram</option>
                                </select>
                            </div>

                            {/* Conditional Input based on contact type */}
                            {formData.contactType === 'WHATSAPP' && (
                                <div className="grid grid-cols-[100px_1fr] gap-2 mt-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+</span>
                                        <input
                                            type="tel"
                                            value={formData.countryCode || ''}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '')
                                                setFormData({ ...formData, countryCode: value })
                                            }}
                                            className="input-field w-full pl-7 text-center"
                                            placeholder="91"
                                            maxLength={4}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.contactValue}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '')
                                                setFormData({ ...formData, contactValue: value })
                                            }}
                                            className="input-field w-full pl-11"
                                            placeholder="Phone number"
                                            pattern="[0-9]*"
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.contactType === 'LINE' && (
                                <div className="relative mt-2">
                                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.contactValue}
                                        onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                                        className="input-field w-full pl-11"
                                        placeholder="Enter Line ID"
                                    />
                                </div>
                            )}

                            {formData.contactType === 'TELEGRAM' && (
                                <div className="relative mt-2">
                                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.contactValue}
                                        onChange={(e) => setFormData({ ...formData, contactValue: e.target.value })}
                                        className="input-field w-full pl-11"
                                        placeholder="Enter Telegram ID (e.g. @username)"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create Account
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    © Copyright Konoha Bazaar, All Rights Reserved.
                </p>
            </motion.div>
        </div>
    )
}
