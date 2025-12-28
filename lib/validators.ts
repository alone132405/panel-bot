import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const contactTypeEnum = z.enum(['WHATSAPP', 'LINE', 'TELEGRAM'])

export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    contactType: contactTypeEnum.optional(),
    contactValue: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
}).refine(data => {
    // If contactType is set, contactValue must also be set (or both empty)
    if (data.contactType && !data.contactValue) {
        return false
    }
    // If WhatsApp, contactValue must be numbers only (allow + prefix for country code)
    if (data.contactType === 'WHATSAPP' && data.contactValue) {
        // Allow format like +911234567890 or just 1234567890
        return /^\+?\d+$/.test(data.contactValue)
    }
    return true
}, {
    message: "Invalid contact value. For WhatsApp, use numbers only (e.g., +911234567890)",
    path: ['contactValue'],
})

export const settingUpdateSchema = z.object({
    path: z.string(),
    value: z.any(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type SettingUpdateInput = z.infer<typeof settingUpdateSchema>
export type ContactType = z.infer<typeof contactTypeEnum>

