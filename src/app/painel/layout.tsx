import type { ReactNode } from 'react'
import { Providers } from './providers'

export default function PainelLayout({ children }: { children: ReactNode }) {
    return <Providers>{children}</Providers>
}
