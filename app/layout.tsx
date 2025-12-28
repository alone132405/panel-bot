import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from '@/components/providers/AuthProvider'
import ToasterProvider from '@/components/providers/ToasterProvider'

// Force dynamic rendering for all pages to avoid useContext errors during build
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Bot Management Dashboard',
    description: 'Premium dashboard for managing your bot configurations',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    {children}
                    <ToasterProvider />
                </AuthProvider>
            </body>
        </html>
    )
}
