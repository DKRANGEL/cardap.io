import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
    title: 'cardap.io',
    description: 'Cardápio digital para lojistas simples.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="pt-BR">
        <body className="min-h-dvh bg-background text-foreground">
        <Providers>{children}</Providers>
        </body>
        </html>
    )
}
