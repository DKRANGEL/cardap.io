'use client'

import type { ReactNode } from 'react'
import { HeroUIProvider } from '@heroui/react'

export function Providers({ children }: { children: ReactNode }) {
    return <HeroUIProvider locale="pt-BR">{children}</HeroUIProvider>
}
