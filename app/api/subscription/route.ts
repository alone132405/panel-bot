import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - this route uses headers
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const subscription = await prisma.subscription.findUnique({
            where: { userId: session.user.id },
        })

        if (!subscription) {
            return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
        }

        return NextResponse.json(subscription)
    } catch (error) {
        console.error('Subscription fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
