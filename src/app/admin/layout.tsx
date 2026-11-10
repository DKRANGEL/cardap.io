import type { ReactNode } from 'react'
import { Marca } from '@/components/marca'
import { LogoutButton } from '../painel/logout-button'
import { MenuAdmin } from './menu-admin'

export const metadata = { title: 'Administração — cardap.io', robots: { index: false, follow: false } }

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-dvh md:flex">
            <aside className="flex flex-col gap-3 border-b border-borda px-4 py-3 md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:gap-6 md:border-r md:border-b-0 md:py-6">
                <div className="flex items-baseline gap-2">
                    <Marca />
                    <span className="rounded-xs bg-superficie-marcada px-1.5 text-xs leading-5 font-semibold text-tinta-media">Admin</span>
                </div>
                <MenuAdmin />
                <div className="mt-auto hidden md:block">
                    <LogoutButton />
                </div>
            </aside>
            <div className="min-w-0 flex-1">{children}</div>
            <div className="px-4 pb-6 md:hidden">
                <LogoutButton />
            </div>
        </div>
    )
}
