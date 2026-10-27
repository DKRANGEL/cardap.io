'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HouseIcon, LayoutListIcon, Share2Icon, StoreIcon, type LucideIcon } from 'lucide-react'

type Aba = {
    href: string
    rotulo: string
    Icone: LucideIcon
    exata?: boolean
}

const ABAS: Aba[] = [
    { href: '/painel', rotulo: 'Início', Icone: HouseIcon, exata: true },
    { href: '/painel/cardapio', rotulo: 'Cardápio', Icone: LayoutListIcon },
    { href: '/painel/divulgar', rotulo: 'Divulgar', Icone: Share2Icon },
    { href: '/painel/loja', rotulo: 'Loja', Icone: StoreIcon },
]

function estaAtiva(pathname: string, aba: Aba) {
    if (aba.exata) return pathname === aba.href
    return pathname === aba.href || pathname.startsWith(`${aba.href}/`)
}

export function BarraAbas() {
    const pathname = usePathname()

    return (
        <nav
            aria-label="Painel"
            className="fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-superficie pb-[env(safe-area-inset-bottom)] shadow-barra"
        >
            <ul className="mx-auto flex h-14 w-full max-w-[448px]">
                {ABAS.map((aba) => {
                    const ativa = estaAtiva(pathname, aba)
                    return (
                        <li key={aba.href} className="flex-1">
                            <Link
                                href={aba.href}
                                aria-current={ativa ? 'page' : undefined}
                                className={`flex h-full min-w-11 flex-col items-center justify-center gap-0.5 ${
                                    ativa ? 'text-acao' : 'text-tinta-media'
                                }`}
                            >
                                <aba.Icone aria-hidden className="h-[22px] w-[22px]" strokeWidth={ativa ? 2.4 : 2} />
                                <span className={`text-[11px] leading-[14px] ${ativa ? 'font-bold' : 'font-medium'}`}>
                                    {aba.rotulo}
                                </span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
