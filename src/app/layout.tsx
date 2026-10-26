'use client'
import { HeroUIProvider } from '@heroui/react'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
        <body className="min-h-dvh bg-background text-foreground">
        <HeroUIProvider locale="pt-BR">{children}</HeroUIProvider>
        </body>
        </html>
    )
}
