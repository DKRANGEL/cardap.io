'use client'

import { toBRL } from '@/lib/moeda'

type Props = {
    totalItens: number
    total: number
    onAbrir: () => void
}

export function BarraPedido({ totalItens, total, onAbrir }: Props) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-borda bg-superficie px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-barra">
            <button
                type="button"
                onClick={onAbrir}
                className="mx-auto flex h-13 w-full max-w-[520px] items-center justify-between rounded-full bg-[var(--loja)] px-5 text-base font-semibold text-[var(--loja-contraste)]"
            >
                <span>Ver pedido · {totalItens} {totalItens === 1 ? 'item' : 'itens'}</span>
                <span className="tabular-nums">{toBRL(total)}</span>
            </button>
        </div>
    )
}
