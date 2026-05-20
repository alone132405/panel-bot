'use client'

import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import {
    Activity,
    BarChart3,
    Database,
    Home,
    LogOut,
    Menu,
    Settings2,
    ShieldCheck,
    UserCog,
    X,
} from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface SidebarLayoutProps {
    children: ReactNode
}

interface NavItem {
    name: string
    href: string
    icon: any
    description: string
}

const navItems: NavItem[] = [
    { name: 'Overview', href: '/dashboard', icon: Home, description: 'Network status' },
    { name: 'Protocols', href: '/dashboard/settings', icon: Settings2, description: 'Bot settings' },
    { name: 'Vault', href: '/dashboard/bank', icon: Database, description: 'Bank control' },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, description: 'Exports' },
]

export default function SidebarLayout({ children }: SidebarLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, status } = useSession()
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    const allNavItems = session?.user?.role === 'ADMIN'
        ? [...navItems, { name: 'Admin', href: '/dashboard/admin', icon: UserCog, description: 'Access control' }]
        : navItems
    const mobileBottomNavItems = navItems

    const pageTitle = pathname?.includes('/settings') ? 'Protocol Matrix'
        : pathname?.includes('/bank') ? 'Vault Systems'
            : pathname?.includes('/reports') ? 'Telemetry Reports'
                : pathname?.includes('/admin') ? 'Nexus Administration'
                    : 'Network Overview'

    const handleLogout = async () => {
        await signOut({ redirect: false })
        toast.success('Logged out successfully')
        router.push('/login')
    }

    const isActive = (href: string) => href === '/dashboard'
        ? pathname === '/dashboard'
        : pathname === href || pathname?.startsWith(`${href}/`)

    useEffect(() => {
        setMobileNavOpen(false)
    }, [pathname])

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login')
        }
    }, [router, status])

    useEffect(() => {
        if (!mobileNavOpen) {
            document.body.style.removeProperty('overflow')
            return
        }

        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.removeProperty('overflow')
        }
    }, [mobileNavOpen])

    if (status === 'loading' || status === 'unauthenticated') {
        return (
            <div className="app-frame flex min-h-screen items-center justify-center bg-bg-base p-6">
                <div className="panel-solid flex w-full max-w-sm flex-col items-center rounded-lg p-8 text-center">
                    <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-accent-1/25 border-t-accent-1" />
                    <p className="font-orbitron text-[13px] font-bold uppercase tracking-[0.18em] text-text-primary">Checking session</p>
                    <p className="mt-2 text-sm text-text-muted">Authenticating dashboard access.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="app-frame min-h-screen">
            <div className="relative z-10 flex min-h-screen">
                <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-[280px] shrink-0 flex-col border-r border-border bg-[#05070b]/90 backdrop-blur-xl overflow-hidden z-20">
                    <div className="p-6">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-white/[0.03] p-4 text-left transition-all hover:border-accent-1/35 hover:bg-white/[0.05]"
                        >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-accent-1/20 bg-bg-elevated">
                                <Image src="/logo.png" alt="Konoha Bazaar" fill sizes="48px" className="object-contain p-1.5" priority />
                            </div>
                            <div className="min-w-0">
                                <div className="font-orbitron text-[12px] font-bold tracking-[0.28em] text-accent-1">KONOHA</div>
                                <div className="font-orbitron text-[12px] font-bold tracking-[0.28em] text-text-primary">BAZAAR</div>
                            </div>
                        </button>
                    </div>

                    <div className="px-6">
                        <div className="panel-inset rounded-2xl p-4">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-text-muted">Core Status</span>
                                <span className="h-2 w-2 rounded-full bg-accent-1 shadow-glow-mint" />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[12px]">
                                <div className="rounded-xl bg-white/[0.03] p-3">
                                    <div className="text-text-muted">API</div>
                                    <div className="font-mono font-bold text-accent-1">READY</div>
                                </div>
                                <div className="rounded-xl bg-white/[0.03] p-3">
                                    <div className="text-text-muted">SYNC</div>
                                    <div className="font-mono font-bold text-accent-cyan">LIVE</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="mt-6 flex-1 space-y-1 px-4">
                        {allNavItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)

                            return (
                                <button
                                    key={item.href}
                                    onClick={() => router.push(item.href)}
                                    className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-1/35 ${active
                                        ? 'border-accent-1/35 bg-accent-1/10 text-accent-1 shadow-[inset_0_0_0_1px_rgba(33,243,177,0.12)]'
                                        : 'border-transparent text-text-muted hover:border-border hover:bg-white/[0.04] hover:text-text-primary'
                                        }`}
                                >
                                    {active && (
                                        <span
                                            className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-accent-1 shadow-glow-mint"
                                        />
                                    )}
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${active ? 'border-accent-1/25 bg-accent-1/10' : 'border-border bg-white/[0.03]'}`}>
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[14px] font-bold">{item.name}</span>
                                        <span className="block truncate text-[11px] text-text-muted">{item.description}</span>
                                    </span>
                                </button>
                            )
                        })}
                    </nav>

                    <div className="border-t border-border p-4">
                        <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary font-orbitron font-bold text-[#031017]">
                                {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-[13px] font-bold text-text-primary">{session?.user?.name || 'Operator'}</div>
                                <div className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">{session?.user?.role || 'USER'}</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-accent-3/20 bg-accent-3/10 px-4 py-3 text-[13px] font-bold text-accent-3 transition-all hover:bg-accent-3/20"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col lg:pl-[280px]">
                    <header className="sticky top-0 z-30 border-b border-border bg-[#05070b]/76 px-4 py-3 backdrop-blur-xl md:px-8">
                        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => router.push('/dashboard')}
                                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white/[0.04] lg:hidden"
                                    aria-label="Go to dashboard"
                                >
                                    <Image src="/logo.png" alt="Konoha Bazaar" width={32} height={32} className="object-contain" />
                                </button>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="hidden h-4 w-4 text-accent-1 sm:block" />
                                        <h1 className="truncate font-orbitron text-[18px] font-bold tracking-[0.14em] text-text-primary md:text-[22px]">
                                            {pageTitle}
                                        </h1>
                                    </div>
                                    <div className="mt-1 hidden items-center gap-2 text-[12px] text-text-muted sm:flex">
                                        <Activity className="h-3.5 w-3.5 text-accent-cyan" />
                                        Backend links preserved. JSON configuration bridge online.
                                    </div>
                                </div>
                            </div>

                            <div className="hidden items-center gap-3 md:flex">
                                <div className="rounded-full border border-accent-1/20 bg-accent-1/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-1">
                                    Live Session
                                </div>
                                <div className="rounded-full border border-border bg-white/[0.03] px-3 py-1.5 text-[12px] text-text-muted">
                                    {session?.user?.email || 'authenticated'}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-x-hidden px-4 pb-28 pt-5 md:px-8 lg:pb-8">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.24, ease: 'easeOut' }}
                            className="mx-auto max-w-[1480px]"
                        >
                            {children}
                        </motion.div>
                    </main>
                </div>
            </div>

            <div
                className={`fixed inset-0 z-[70] transition-all duration-200 lg:hidden ${mobileNavOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
                aria-hidden={!mobileNavOpen}
            >
                <button
                    type="button"
                    onClick={() => setMobileNavOpen(false)}
                    className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 ${mobileNavOpen ? 'opacity-100' : 'opacity-0'}`}
                    aria-label="Close navigation menu"
                />
                <aside
                    className={`absolute inset-x-0 top-0 flex max-h-[min(82vh,720px)] flex-col overflow-hidden rounded-b-[28px] border-b border-border bg-[#05070b] shadow-[0_24px_64px_rgba(0,0,0,0.45)] transition-transform duration-200 ${mobileNavOpen ? 'translate-y-0' : '-translate-y-full'}`}
                >
                    <div className="flex items-center justify-between border-b border-border p-4">
                        <button
                            type="button"
                            onClick={() => {
                                setMobileNavOpen(false)
                                router.push('/dashboard')
                            }}
                            className="group flex min-w-0 items-center gap-3 text-left"
                        >
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-accent-1/20 bg-bg-elevated">
                                <Image src="/logo.png" alt="Konoha Bazaar" fill sizes="44px" className="object-contain p-1.5" />
                            </div>
                            <div className="min-w-0">
                                <div className="font-orbitron text-[11px] font-bold tracking-[0.24em] text-accent-1">KONOHA</div>
                                <div className="font-orbitron text-[11px] font-bold tracking-[0.24em] text-text-primary">BAZAAR</div>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileNavOpen(false)}
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white/[0.03] text-text-primary"
                            aria-label="Close navigation menu"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="border-b border-border p-4">
                        <div className="rounded-2xl bg-white/[0.03] p-3">
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary font-orbitron font-bold text-[#031017]">
                                    {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-[13px] font-bold text-text-primary">{session?.user?.name || 'Operator'}</div>
                                    <div className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">{session?.user?.role || 'USER'}</div>
                                </div>
                            </div>
                            <div className="rounded-full border border-accent-1/20 bg-accent-1/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-1">
                                {session?.user?.email || 'authenticated'}
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                        {allNavItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)

                            return (
                                <button
                                    key={item.href}
                                    type="button"
                                    onClick={() => {
                                        setMobileNavOpen(false)
                                        router.push(item.href)
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${active
                                        ? 'border-accent-1/35 bg-accent-1/10 text-accent-1'
                                        : 'border-border/70 bg-white/[0.02] text-text-muted hover:bg-white/[0.04] hover:text-text-primary'
                                        }`}
                                >
                                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${active ? 'border-accent-1/25 bg-accent-1/10' : 'border-border bg-white/[0.03]'}`}>
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[14px] font-bold">{item.name}</span>
                                        <span className="block truncate text-[11px] text-text-muted">{item.description}</span>
                                    </span>
                                </button>
                            )
                        })}
                    </nav>

                    <div className="border-t border-border p-4">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-accent-3/20 bg-accent-3/10 px-4 py-3 text-[13px] font-bold text-accent-3 transition-all hover:bg-accent-3/20"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </aside>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-[#05070b]/90 px-2 py-2 backdrop-blur-xl lg:hidden">
                <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
                    {mobileBottomNavItems.slice(0, 2).map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <button
                                key={item.href}
                                type="button"
                                onClick={() => router.push(item.href)}
                                className={`flex min-h-[56px] flex-col items-center justify-center rounded-2xl px-1 text-[11px] font-bold transition-all ${active
                                    ? 'bg-accent-1/10 text-accent-1'
                                    : 'text-text-muted hover:bg-white/[0.04] hover:text-text-primary'
                                    }`}
                            >
                                <Icon className="mb-1 h-4 w-4" />
                                <span className="truncate">{item.name}</span>
                            </button>
                        )
                    })}
                    <div className="flex items-start justify-center">
                        <button
                            type="button"
                            onClick={() => setMobileNavOpen(true)}
                            className="relative -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00FFB2] to-[#00D4FF] text-[#05070B] shadow-[0_8px_32px_rgba(0,255,178,0.4)] ring-[6px] ring-[#05070b] transition-transform active:scale-95"
                            aria-label="Open navigation menu"
                        >
                            <Menu className="h-6 w-6" strokeWidth={2.5} />
                        </button>
                    </div>
                    {mobileBottomNavItems.slice(2).map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <button
                                key={item.href}
                                type="button"
                                onClick={() => router.push(item.href)}
                                className={`flex min-h-[56px] flex-col items-center justify-center rounded-2xl px-1 text-[11px] font-bold transition-all ${active
                                    ? 'bg-accent-1/10 text-accent-1'
                                    : 'text-text-muted hover:bg-white/[0.04] hover:text-text-primary'
                                    }`}
                            >
                                <Icon className="mb-1 h-4 w-4" />
                                <span className="truncate">{item.name}</span>
                            </button>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
