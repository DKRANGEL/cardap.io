'use client'

import { MinusIcon, PlusIcon } from 'lucide-react'

const BOTAO_LOJA = 'bg-[var(--loja)] text-[var(--loja-contraste)]'
const BOTAO_BASE = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full active:opacity-80'

type Props = {
    nome: string
    qtd: number
    onAdd: () => void
    onSub: () => void
}

export function SeletorQuantidade({ nome, qtd, onAdd, onSub }: Props) {
    if (qtd === 0) {
        return (
            <button type="button" aria-label={`Adicionar ${nome}`} onClick={onAdd}
                    className={`${BOTAO_BASE} ${BOTAO_LOJA}`}>
                <PlusIcon aria-hidden className="h-5 w-5" />
            </button>
        )
    }

    return (
        <div className="flex items-center">
            <button type="button" aria-label={`Diminuir ${nome}`} onClick={onSub}
                    className={`${BOTAO_BASE} bg-superficie-marcada text-tinta`}>
                <MinusIcon aria-hidden className="h-5 w-5" />
            </button>
            <span aria-live="polite" className="min-w-7 text-center text-base font-bold tabular-nums">{qtd}</span>
            <button type="button" aria-label={`Aumentar ${nome}`} onClick={onAdd}
                    className={`${BOTAO_BASE} ${BOTAO_LOJA}`}>
                <PlusIcon aria-hidden className="h-5 w-5" />
            </button>
        </div>
    )
}
