'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UsersIcon, type LucideIcon } from 'lucide-react'

type Item = { href: string; rotulo: string; Icone: LucideIcon }

const ITENS: Item[] = [{ href: '/admin/clientes', rotulo: 'Clientes', Icone: UsersIcon }]

export function MenuAdmin() {
    const pathname = usePathname()

    return (
        <nav aria-label="Administração">
            <ul className="flex gap-1 md:flex-col">
                {ITENS.map(({ href, rotulo, Icone }) => {
                    const ativo = pathname === href || pathname.startsWith(`${href}/`)
                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                aria-current={ativo ? 'page' : undefined}
                                className={`flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold ${
                                    ativo ? 'bg-acao text-acao-contraste' : 'text-tinta-media'
                                }`}
                            >
                                <Icone aria-hidden className="h-5 w-5" />
                                {rotulo}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
