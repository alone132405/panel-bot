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

        // Fetch all subscriptions associated with the user's IGG IDs
        const subscriptions = await prisma.subscription.findMany({
            where: {
                igg: {
                    userId: session.user.id
                }
            },
            include: {
                igg: {
                    select: {
                        iggId: true,
                        displayName: true
                    }
                }
            }
        })

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ error: 'No active subscriptions found' }, { status: 404 })
        }

        // Return the list of subscriptions
        return NextResponse.json(subscriptions)
    } catch (error) {
        console.error('Subscription fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
