'use client'

import { motion } from 'framer-motion'
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
}

const navItems: NavItem[] = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Bot Settings', href: '/dashboard/settings', icon: Settings2 },
    { name: 'Bank Settings', href: '/dashboard/bank', icon: Database },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
]

export default function SidebarLayout({ children }: SidebarLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session } = useSession()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        await signOut({ redirect: false })
        toast.success('Logged out successfully')
        router.push('/login')
    }

    return (
        <div className="min-h-screen bg-background-primary flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 80 }}
                className="hidden lg:flex flex-col bg-background-secondary border-r border-white/5 relative z-20 h-screen sticky top-0"
            >
                {/* Logo */}
                <div className={`h-20 flex items-center border-b border-white/5 flex-shrink-0 ${sidebarOpen ? 'justify-between px-6' : 'justify-center px-4'}`}>
                    {sidebarOpen && (
                        <motion.div
                            initial={false}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                                <Image src="/logo.png" alt="Konoha Bot" width={40} height={40} className="object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Konoha Bot</h1>
                                <p className="text-xs text-gray-400">Pro Dashboard</p>
                            </div>
                        </motion.div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-10 h-10 rounded-xl bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin min-h-0">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        // For Home, only match exact path. For others, also match sub-paths
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname === item.href || pathname?.startsWith(item.href + '/')

                        return (
                            <motion.button
                                key={item.name}
                                onClick={() => router.push(item.href)}
                                whileHover={{ x: 4 }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary-500/10 text-primary-400 border-l-4 border-primary-500 pl-3'
                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && (
                                    <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                                )}
                            </motion.button>
                        )
                    })}

                    {/* Admin Link - Only for admin users */}
                    {session?.user?.role === 'ADMIN' && (
                        <>
                            <div className="my-4 border-t border-white/10" />
                            <motion.button
                                onClick={() => router.push('/dashboard/admin')}
                                whileHover={{ x: 4 }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard/admin'
                                    ? 'bg-primary-500/10 text-primary-400 border-l-4 border-primary-500 pl-3'
                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <UserCog className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && (
                                    <span className="flex-1 text-left text-sm font-medium">Admin Panel</span>
                                )}
                            </motion.button>
                        </>
                    )}
                </nav>

                {/* User Profile - Fixed at bottom */}
                <div className={`p-4 border-t border-white/5 flex-shrink-0 ${sidebarOpen ? '' : 'flex flex-col items-center'}`}>
                    <div className={`flex items-center gap-3 rounded-xl bg-surface ${sidebarOpen ? 'p-3' : 'w-12 h-12 p-0 justify-center'}`}>
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {session?.user?.name?.charAt(0) || 'U'}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                                <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`mt-2 flex items-center gap-3 rounded-xl text-gray-300 hover:bg-rose-500/10 hover:text-rose-400 transition-all ${sidebarOpen ? 'w-full px-4 py-2.5' : 'w-10 h-10 justify-center'
                            }`}
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Sidebar */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-80 h-full bg-background-secondary border-r border-white/5 flex flex-col"
                    >
                        {/* Mobile Logo */}
                        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                                    <Image src="/logo.png" alt="Konoha Bot" width={40} height={40} className="object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">Konoha Bot</h1>
                                    <p className="text-xs text-gray-400">Pro Dashboard</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-8 h-8 rounded-lg bg-surface hover:bg-surface-hover flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href

                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => {
                                            router.push(item.href)
                                            setMobileMenuOpen(false)
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-primary-500/10 text-primary-400'
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                                    </button>
                                )
                            })}
                        </nav>

                        {/* Mobile User Profile */}
                        <div className="p-4 border-t border-white/5">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface">
                                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                                    {session?.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full mt-2 flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-300 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </motion.aside>
                </motion.div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-20 bg-background-secondary/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden w-10 h-10 rounded-xl bg-surface hover:bg-surface-hover flex items-center justify-center"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-white">
                            {pathname?.includes('/settings') ? 'Bot Settings' :
                                pathname?.includes('/bank') ? 'Bank Settings' :
                                    pathname?.includes('/reports') ? 'Reports' :
                                        'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                            <p className="text-xs text-gray-400">{session?.user?.email}</p>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
