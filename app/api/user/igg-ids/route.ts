import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                selectedIggId: true,
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
                                status: true,
                                expiresAt: true
                            }
                        }
                    },
                },
            },
        })

        return NextResponse.json({
            iggIds: user?.iggIds || [],
            selectedIggId: user?.selectedIggId || null,
        })
    } catch (error) {
        console.error('Error fetching user IGG IDs:', error)
        return NextResponse.json(
            { error: 'Failed to fetch IGG IDs' },
            { status: 500 }
        )
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { iggId } = await req.json()

        // Verify user owns this IGG ID
        const iggIdRecord = await prisma.iggId.findFirst({
            where: {
                iggId,
                userId: session.user.id,
            },
        })

        if (!iggIdRecord) {
            return NextResponse.json(
                { error: 'IGG ID not found or unauthorized' },
                { status: 404 }
            )
        }

        // Update selected IGG ID
        await prisma.user.update({
            where: { id: session.user.id },
            data: { selectedIggId: iggId },
        })

        return NextResponse.json({
            success: true,
            selectedIggId: iggId,
        })
    } catch (error) {
        console.error('Error updating selected IGG ID:', error)
        return NextResponse.json(
            { error: 'Failed to update selected IGG ID' },
            { status: 500 }
        )
    }
}
