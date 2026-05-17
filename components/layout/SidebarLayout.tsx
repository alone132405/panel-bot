'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import {
    Home,
    Settings2,
    Database,
    BarChart3,
    LogOut,
    Menu,
    X,
    UserCog
} from 'lucide-react'
import { useState, ReactNode } from 'react'
import { toast } from 'sonner'

interface SidebarLayoutProps {
    children: ReactNode
}

interface NavItem {
    name: string
    href: string
    icon: any
    color: string
}

const navItems: NavItem[] = [
    { name: 'Home', href: '/dashboard', icon: Home, color: 'text-accent-1' },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings2, color: 'text-accent-2' },
    { name: 'Bank', href: '/dashboard/bank', icon: Database, color: 'text-accent-gold' },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, color: 'text-[#00BFFF]' },
]

export default function SidebarLayout({ children }: SidebarLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = useSession()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        await signOut({ redirect: false })
        toast.success('Logged out successfully')
        router.push('/login')
    }

    return (
        <div className="min-h-screen flex relative overflow-hidden konoha-bg text-text-primary selection:bg-accent-1/30 selection:text-white font-sans">
            <div className="konoha-blob-1"></div>
            <div className="konoha-blob-2"></div>
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col relative z-20 w-[220px] h-screen sticky top-0 bg-gradient-to-b from-[#0B0B18] to-[#080810] border-r border-accent-2/10 shrink-0">
                {/* TOP: Logo */}
                <div className="pt-8 pb-6 flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16 mb-4">
                        <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
                    </div>
                    <div className="text-center font-orbitron">
                        <div className="text-[11px] tracking-[0.4em] text-accent-1">KONOHA</div>
                        <div className="text-[11px] tracking-[0.4em] text-accent-2">BAZAAR</div>
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-accent-2/30 to-transparent mb-4" />

                {/* Navigation */}
                <nav className="flex-1 px-0 space-y-1 overflow-y-auto scrollbar-thin pb-4">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname === item.href || pathname?.startsWith(item.href + '/')

                        return (
                            <button
                                key={item.name}
                                onClick={() => router.push(item.href)}
                                className={`w-full flex items-center h-12 px-6 transition-all duration-200 ${
                                    isActive
                                        ? 'border-l-[3px] border-accent-1 shadow-[inset_12px_0_20px_-12px_rgba(0,255,178,0.3)] bg-gradient-to-r from-accent-1/10 to-transparent'
                                        : 'border-l-[3px] border-transparent hover:bg-accent-2/5 hover:text-text-primary text-text-muted'
                                }`}
                            >
                                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-accent-1' : item.color}`} />
                                <span className={`ml-[10px] text-[13px] font-medium ${isActive ? 'text-accent-1' : ''}`}>
                                    {item.name}
                                </span>
                            </button>
                        )
                    })}

                    {session?.user?.role === 'ADMIN' && (
                        <>
                            <div className="my-4 mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            <button
                                onClick={() => router.push('/dashboard/admin')}
                                className={`w-full flex items-center h-12 px-6 transition-all duration-200 ${
                                    pathname === '/dashboard/admin'
                                        ? 'border-l-[3px] border-accent-1 shadow-[inset_12px_0_20px_-12px_rgba(0,255,178,0.3)] bg-gradient-to-r from-accent-1/10 to-transparent'
                                        : 'border-l-[3px] border-transparent hover:bg-accent-2/5 hover:text-text-primary text-text-muted'
                                }`}
                            >
                                <UserCog className={`w-[18px] h-[18px] flex-shrink-0 ${pathname === '/dashboard/admin' ? 'text-accent-1' : 'text-accent-3'}`} />
                                <span className={`ml-[10px] text-[13px] font-medium ${pathname === '/dashboard/admin' ? 'text-accent-1' : ''}`}>
                                    Admin
                                </span>
                            </button>
                        </>
                    )}
                </nav>

                {/* BOTTOM: User / Logout */}
                <div className="mt-auto border-t border-accent-2/10">
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-1 to-accent-2 flex items-center justify-center text-bg-base font-bold text-sm shrink-0">
                            {session?.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[12px] text-text-muted truncate">{session?.user?.name || 'User'}</div>
                            <div className="text-[10px] font-orbitron text-accent-1 truncate">{session?.user?.role || 'OPERATOR'}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full group flex items-center justify-center gap-2 py-3 text-text-muted hover:bg-accent-3/10 hover:text-accent-3 transition-colors duration-200"
                    >
                        <LogOut className="w-4 h-4 group-hover:text-accent-3 transition-colors" />
                        <span className="text-[13px] font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lg:hidden fixed inset-0 z-50 flex"
                    >
                        <div className="absolute inset-0 bg-bg-base/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                        
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-[220px] h-full bg-gradient-to-b from-[#0B0B18] to-[#080810] border-r border-accent-2/10 flex flex-col"
                        >
                            {/* Mobile Header */}
                            <div className="p-6 flex items-center justify-between">
                                <div className="text-center font-orbitron">
                                    <div className="text-[11px] tracking-[0.4em] text-accent-1">KONOHA</div>
                                </div>
                                <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {/* Mobile Nav */}
                            <nav className="flex-1 px-0 space-y-1 overflow-y-auto">
                                {navItems.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => { router.push(item.href); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center h-12 px-6 transition-all duration-200 ${pathname === item.href ? 'border-l-[3px] border-accent-1 bg-gradient-to-r from-accent-1/10 to-transparent' : 'border-l-[3px] border-transparent text-text-muted hover:bg-accent-2/5'}`}
                                    >
                                        <item.icon className={`w-[18px] h-[18px] ${pathname === item.href ? 'text-accent-1' : item.color}`} />
                                        <span className={`ml-[10px] text-[13px] font-medium ${pathname === item.href ? 'text-accent-1' : ''}`}>{item.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 z-30 relative h-screen overflow-hidden">
                {/* Floating Header */}
                <div className="px-4 md:px-8 pt-6 pb-2">
                    <header className="h-[72px] bg-bg-surface border border-border rounded-2xl px-6 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="lg:hidden w-10 h-10 rounded-full bg-bg-elevated hover:bg-accent-2/10 flex items-center justify-center transition-colors text-text-primary"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl md:text-2xl font-orbitron font-bold tracking-[0.1em] text-text-primary">
                                {pathname?.includes('/settings') ? 'PROTOCOL CONFIG' :
                                    pathname?.includes('/bank') ? 'VAULT SYSTEMS' :
                                        pathname?.includes('/reports') ? 'TELEMETRY' :
                                            pathname?.includes('/admin') ? 'NEXUS CONTROL' :
                                                'NETWORK OVERVIEW'}
                            </h2>
                        </div>
                    </header>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-8 scrollbar-thin relative">
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="min-h-full py-4 pb-24"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}

