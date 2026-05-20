'use client'

import type { ReactNode } from 'react'
import SidebarLayout from '@/components/layout/SidebarLayout'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <SidebarLayout>{children}</SidebarLayout>
}
