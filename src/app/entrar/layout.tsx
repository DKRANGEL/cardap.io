import type { ReactNode } from 'react'
import { ProvidersHeroUI } from '@/components/providers-heroui'

export default function EntrarLayout({ children }: { children: ReactNode }) {
    return <ProvidersHeroUI>{children}</ProvidersHeroUI>
}
