'use client'

import Image from 'next/image'
import { ShoppingBagIcon } from 'lucide-react'

type Props = {
    nome: string
    logoUrl: string | null
    totalItens: number
    onAbrirPedido: () => void
}

export function Cabecalho({ nome, logoUrl, totalItens, onAbrirPedido }: Props) {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-borda bg-superficie px-4">
            {logoUrl ? (
                <Image src={logoUrl} alt="" width={44} height={44} unoptimized
                       className="h-11 w-11 shrink-0 rounded-sm object-cover" />
            ) : (
                <div aria-hidden
                     className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[var(--loja)] text-xl font-extrabold text-[var(--loja-contraste)]">
                    {nome.charAt(0).toUpperCase()}
                </div>
            )}
            <h1 className="min-w-0 flex-1 truncate text-xl leading-[26px] font-bold tracking-tight">{nome}</h1>
            <button
                type="button"
                onClick={onAbrirPedido}
                aria-label={totalItens > 0 ? `Abrir pedido, ${totalItens} ${totalItens === 1 ? 'item' : 'itens'}` : 'Abrir pedido'}
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-superficie-marcada text-tinta"
            >
                <ShoppingBagIcon aria-hidden className="h-5 w-5" />
                {totalItens > 0 && (
                    <span aria-hidden
                          className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-carvao-900 px-1 text-xs font-bold text-carvao-0">
                        {totalItens}
                    </span>
                )}
            </button>
        </header>
    )
}
