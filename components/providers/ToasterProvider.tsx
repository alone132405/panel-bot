'use client'

import { Toaster } from 'sonner'

export default function ToasterProvider() {
    return (
        <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
                style: {
                    background: '#1a2942',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#f1f5f9',
                },
            }}
        />
    )
}
