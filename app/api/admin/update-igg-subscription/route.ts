
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/adminAuth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const authError = await requireAdmin(req as any)
    if (authError) return authError

    try {
        const { iggId, expiresAt, status } = await req.json()

        if (!iggId) {
            return NextResponse.json(
                { error: 'IGG ID is required' },
                { status: 400 }
            )
        }

        const subscription = await prisma.subscription.upsert({
            where: { iggId },
            create: {
                iggId,
                expiresAt: new Date(expiresAt),
                status: status || 'ACTIVE',
            },
            update: {
                expiresAt: new Date(expiresAt),
                status: status || 'ACTIVE',
            },
        })

        return NextResponse.json({ subscription })
    } catch (error) {
        console.error('Error updating subscription:', error)
        return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
        )
    }
}
