import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // Test database connection
        await prisma.$connect()

        // Try to count users
        const userCount = await prisma.user.count()

        return NextResponse.json({
            status: 'ok',
            database: 'connected',
            userCount,
            message: 'Database connection successful'
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code,
            details: error.toString()
        }, { status: 500 })
    }
}
