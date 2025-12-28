import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is admin
        const adminUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        })

        if (adminUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const { userId } = body

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        // Check if user exists and is pending
        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (user.accountStatus !== 'PENDING') {
            return NextResponse.json(
                { error: 'User is not pending approval' },
                { status: 400 }
            )
        }

        // Update user status to rejected
        const result = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    accountStatus: 'REJECTED',
                },
            })

            // Log the activity
            await tx.activityLog.create({
                data: {
                    userId: session.user.id,
                    action: 'REJECT_USER',
                    category: 'admin',
                    details: {
                        rejectedUserId: userId,
                        rejectedUserEmail: user.email,
                    },
                },
            })

            return updatedUser
        })

        return NextResponse.json({
            success: true,
            message: 'User rejected successfully',
            user: {
                id: result.id,
                email: result.email,
                name: result.name,
                accountStatus: result.accountStatus,
            },
        })
    } catch (error: any) {
        console.error('Error rejecting user:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to reject user' },
            { status: 500 }
        )
    }
}
