import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    const authError = await requireAdmin(req as any)
    if (authError) return authError

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                accountStatus: true,
                contactType: true,
                contactValue: true,
                selectedIggId: true,
                createdAt: true,
                iggIds: {
                    select: {
                        id: true,
                        iggId: true,
                        displayName: true,
                        isActive: true,
                        status: true,
                        lastSync: true,
                        subscription: {
                            select: {
                                plan: true,
                                status: true,
                                expiresAt: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}
