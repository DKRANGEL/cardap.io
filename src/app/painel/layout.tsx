import type { ReactNode } from 'react'
import { ProvidersHeroUI } from '@/components/providers-heroui'

export default function PainelLayout({ children }: { children: ReactNode }) {
    return <ProvidersHeroUI>{children}</ProvidersHeroUI>
}
