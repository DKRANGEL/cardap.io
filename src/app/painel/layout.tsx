import type { ReactNode } from 'react'
import { ProvidersHeroUI } from '@/components/providers-heroui'
import { BarraAbas } from './barra-abas'

export default function PainelLayout({ children }: { children: ReactNode }) {
    return (
        <ProvidersHeroUI>
            <div className="pb-[calc(56px+env(safe-area-inset-bottom))]">{children}</div>
            <BarraAbas />
        </ProvidersHeroUI>
    )
}
