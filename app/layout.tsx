import type { Metadata } from 'next'
import { Orbitron, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/components/providers/AuthProvider'
import ToasterProvider from '@/components/providers/ToasterProvider'

const orbitron = Orbitron({ 
  subsets: ['latin'], 
  variable: '--font-orbitron' 
})

const dmSans = DM_Sans({ 
  subsets: ['latin'], 
  variable: '--font-dm-sans' 
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-jetbrains' 
})

// Force dynamic rendering for all pages to avoid useContext errors during build
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Konoha Bazaar',
    description: 'Premium dashboard for managing your bot configurations',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${orbitron.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
            <body className="font-sans">
                <AuthProvider>
                    {children}
                    <ToasterProvider />
                </AuthProvider>
            </body>
        </html>
    )
}
