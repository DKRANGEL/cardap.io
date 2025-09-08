'use client'
import type { ReactNode } from 'react'
import { HeroUIProvider } from '@heroui/react'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="pt-BR">
        <body>
        <HeroUIProvider>{children}</HeroUIProvider>
        </body>
        </html>
    )
}
