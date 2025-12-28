import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

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
        const { userId, subscriptionDays, subscriptionMonths, subscriptionYears, iggId, nickname, plan } = body

        if (!userId || !iggId) {
            return NextResponse.json(
                { error: 'User ID and IGG ID are required' },
                { status: 400 }
            )
        }

        // Check if user exists and is pending
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { iggIds: true },
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

        // Check if IGG ID is already assigned
        const existingIggId = await prisma.iggId.findUnique({
            where: { iggId },
        })

        if (existingIggId) {
            return NextResponse.json(
                { error: 'IGG ID is already assigned to another user' },
                { status: 400 }
            )
        }

        // Calculate subscription expiry date
        const now = new Date()
        const expiresAt = new Date(now)
        expiresAt.setDate(expiresAt.getDate() + (subscriptionDays || 0))
        expiresAt.setMonth(expiresAt.getMonth() + (subscriptionMonths || 0))
        expiresAt.setFullYear(expiresAt.getFullYear() + (subscriptionYears || 0))

        // Ensure at least some subscription time is set
        if (expiresAt <= now) {
            return NextResponse.json(
                { error: 'Please set a valid subscription duration' },
                { status: 400 }
            )
        }

        // Create config directory for the IGG ID if it doesn't exist
        const configDir = path.join(process.cwd(), 'config', iggId)
        try {
            await fs.mkdir(configDir, { recursive: true })

            // Create default settings.json
            const defaultSettings = {
                connectionSettings: { reconnectTime: 5, otherLoginTime: 30 },
                miscSettings: { useVipPoints: true, useExpItems: true },
                questSettings: { dailyLoginGift: true },
                guildSettings: { sendGuildHelp: true, requestGuildHelp: true },
            }
            await fs.writeFile(
                path.join(configDir, 'settings.json'),
                JSON.stringify(defaultSettings, null, 2)
            )

            // Create default banksettings.json
            const defaultBankSettings = {
                enableBank: false,
                cmdPrefix: '!',
                guildCommands: [],
            }
            await fs.writeFile(
                path.join(configDir, 'banksettings.json'),
                JSON.stringify(defaultBankSettings, null, 2)
            )
        } catch (fsError) {
            console.error('Error creating config directory:', fsError)
            // Continue even if directory creation fails
        }

        // Update user in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update user status
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: {
                    accountStatus: 'APPROVED',
                    selectedIggId: iggId,
                },
            })

            // Create IGG ID record with subscription
            await tx.iggId.create({
                data: {
                    iggId,
                    displayName: nickname || null,
                    userId,
                    isActive: true,
                    status: 'OFFLINE',
                    subscription: {
                        create: {
                            plan: plan || 'BANK_BOT',
                            status: 'ACTIVE',
                            expiresAt,
                        }
                    }
                },
            })

            // Log the activity
            await tx.activityLog.create({
                data: {
                    userId: session.user.id,
                    action: 'APPROVE_USER',
                    iggId,
                    category: 'admin',
                    details: {
                        approvedUserId: userId,
                        approvedUserEmail: user.email,
                        subscriptionDays,
                        subscriptionMonths,
                        subscriptionYears,
                        expiresAt: expiresAt.toISOString(),
                    },
                },
            })

            return updatedUser
        })

        return NextResponse.json({
            success: true,
            message: 'User approved successfully',
            user: {
                id: result.id,
                email: result.email,
                name: result.name,
                accountStatus: result.accountStatus,
            },
        })
    } catch (error: any) {
        console.error('Error approving user:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to approve user' },
            { status: 500 }
        )
    }
}
