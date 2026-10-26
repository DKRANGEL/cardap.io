'use client'

import { useEffect, useRef } from 'react'

type Props = {
    categorias: { id: string; nome: string }[]
    ativaId: string | null
    onSelecionar: (id: string) => void
}

export function ChipsCategoria({ categorias, ativaId, onSelecionar }: Props) {
    const faixa = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = faixa.current
        const ativo = container?.querySelector<HTMLElement>('[aria-current="true"]')
        if (!container || !ativo) return
        const alvo = ativo.offsetLeft - (container.clientWidth - ativo.offsetWidth) / 2
        container.scrollTo({ left: alvo, behavior: 'smooth' })
    }, [ativaId])

    if (categorias.length === 0) return null

    return (
        <nav aria-label="Categorias" className="sticky top-16 z-30 border-b border-borda bg-superficie">
            <div ref={faixa}
                 className="relative flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categorias.map((categoria) => {
                    const ativa = categoria.id === ativaId
                    return (
                        <button
                            key={categoria.id}
                            type="button"
                            aria-current={ativa ? 'true' : undefined}
                            onClick={() => onSelecionar(categoria.id)}
                            className={`h-11 shrink-0 rounded-full px-4 text-[15px] leading-5 font-semibold whitespace-nowrap ${
                                ativa
                                    ? 'bg-[var(--loja)] text-[var(--loja-contraste)]'
                                    : 'bg-superficie-marcada text-tinta'
                            }`}
                        >
                            {categoria.nome}
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
