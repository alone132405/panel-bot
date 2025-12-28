'use client'

import { ReactNode } from 'react'
import SidebarLayout from '@/components/layout/SidebarLayout'
import { Toaster } from 'sonner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SidebarLayout>{children}</SidebarLayout>
        </>
    )
}
