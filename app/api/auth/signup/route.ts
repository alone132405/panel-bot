import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { signupSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Validate input with Zod schema
        const validatedData = signupSchema.parse(body)

        // Extract only needed fields (exclude confirmPassword)
        const { name, email, password, contactType, contactValue } = validatedData

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create user with PENDING status (no subscription - admin will set during approval)
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                contactType: contactType || null,
                contactValue: contactValue || null,
                // accountStatus defaults to PENDING from schema
            },
        })

        return NextResponse.json(
            {
                message: 'Account created successfully. Please wait for admin approval.',
                pending: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        // Safe error logging
        if (error instanceof Error) {
            console.error('Signup error:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
            })
        } else {
            console.error('Signup error:', String(error))
        }

        // Handle Zod validation errors
        if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input data' },
                { status: 400 }
            )
        }

        // Return generic error
        const errorMessage = error instanceof Error ? error.message : 'Internal server error'
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}
