import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import type { ReactNode } from 'react'
import { Providers } from './providers'
import './globals.css'

const archivo = Archivo({
    subsets: ['latin'],
    display: 'swap',
    variable: '--fonte-archivo',
    axes: ['wdth'],
})

export const metadata: Metadata = {
    title: 'cardap.io',
    description: 'Cardápio digital para lojistas simples.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="pt-BR" className={archivo.variable}>
        <body className="min-h-dvh bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
        </body>
        </html>
    )
}
