'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { XIcon } from 'lucide-react'
import type { Produto } from '@/lib/types'
import { toBRL } from '@/lib/moeda'
import { FotoProduto } from './foto-produto'
import { SeletorQuantidade } from './seletor-quantidade'

const DURACAO_MS = 240
const LIMITE_ARRASTO_PX = 100

type Item = { produto: Produto; qtd: number }

type Props = {
    aberto: boolean
    onFechar: () => void
    itens: Item[]
    total: number
    onAdd: (id: string) => void
    onSub: (id: string) => void
    onLimpar: () => void
}

export function FolhaPedido({ aberto, onFechar, itens, total, onAdd, onSub, onLimpar }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const inicioY = useRef<number | null>(null)
    const [visivel, setVisivel] = useState(false)
    const [arrasto, setArrasto] = useState(0)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (aberto) {
            if (!dialog.open) dialog.showModal()
            document.body.style.overflow = 'hidden'
            let quadro = requestAnimationFrame(() => {
                quadro = requestAnimationFrame(() => setVisivel(true))
            })
            return () => cancelAnimationFrame(quadro)
        }

        setVisivel(false)
        document.body.style.overflow = ''
        const espera = setTimeout(() => {
            if (dialog.open) dialog.close()
        }, DURACAO_MS)
        return () => clearTimeout(espera)
    }, [aberto])

    useEffect(() => () => {
        document.body.style.overflow = ''
    }, [])

    const aoComecarArrasto = (e: PointerEvent<HTMLDivElement>) => {
        inicioY.current = e.clientY
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const aoArrastar = (e: PointerEvent<HTMLDivElement>) => {
        if (inicioY.current === null) return
        setArrasto(Math.max(0, e.clientY - inicioY.current))
    }

    const aoSoltar = (fechar: boolean) => {
        if (inicioY.current === null) return
        inicioY.current = null
        const passou = fechar && arrasto > LIMITE_ARRASTO_PX
        setArrasto(0)
        if (passou) onFechar()
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="folha-titulo"
            onCancel={(e) => {
                e.preventDefault()
                onFechar()
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onFechar()
            }}
            className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-tinta backdrop:bg-[rgba(28,24,20,0.5)] open:flex open:flex-col open:justify-end"
        >
            <div
                style={arrasto > 0 ? { transform: `translateY(${arrasto}px)`, transition: 'none' } : undefined}
                className={`mx-auto flex max-h-[88dvh] w-full max-w-[520px] flex-col rounded-t-xl bg-superficie shadow-folha transition-transform duration-[240ms] ease-out motion-reduce:transition-none ${
                    visivel ? 'translate-y-0' : 'translate-y-full'
                }`}
            >
                <div
                    onPointerDown={aoComecarArrasto}
                    onPointerMove={aoArrastar}
                    onPointerUp={() => aoSoltar(true)}
                    onPointerCancel={() => aoSoltar(false)}
                    className="flex h-9 shrink-0 cursor-grab touch-none items-start justify-center pt-2"
                >
                    <span aria-hidden className="h-1 w-9 rounded-full bg-carvao-300" />
                </div>

                <div className="flex shrink-0 items-center justify-between px-4 pb-2">
                    <h2 id="folha-titulo" className="text-xl leading-[26px] font-bold tracking-tight">Seu pedido</h2>
                    <button type="button" onClick={onFechar} aria-label="Fechar pedido"
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-superficie-marcada">
                        <XIcon aria-hidden className="h-5 w-5" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
                    {itens.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                            <p className="text-[17px] leading-[22px] font-bold">Seu pedido está vazio</p>
                            <p className="text-[15px] leading-[22px] text-tinta-media">Adicione itens do cardápio pra continuar.</p>
                            <button type="button" onClick={onFechar}
                                    className="mt-1 h-[52px] w-full rounded-full bg-superficie-marcada text-base font-semibold">
                                Voltar ao cardápio
                            </button>
                        </div>
                    ) : (
                        <ul className="flex flex-col divide-y divide-borda">
                            {itens.map(({ produto, qtd }) => (
                                <li key={produto.id} className="flex items-center gap-3 py-3">
                                    <FotoProduto src={produto.foto_url} nome={produto.nome} tamanho={56} raio="rounded-sm" />
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 text-[15px] leading-5 font-semibold">{produto.nome}</p>
                                        <p className="text-sm leading-5 tabular-nums text-tinta-media">
                                            {toBRL(produto.preco_centavos * qtd)}
                                        </p>
                                    </div>
                                    <SeletorQuantidade
                                        nome={produto.nome}
                                        qtd={qtd}
                                        onAdd={() => onAdd(produto.id)}
                                        onSub={() => onSub(produto.id)}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {itens.length > 0 && (
                    <div className="flex shrink-0 flex-col gap-3 border-t border-borda px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
                        <div className="flex items-baseline justify-between">
                            <span className="text-[15px] leading-[22px] text-tinta-media">Total</span>
                            <span className="text-[22px] leading-[26px] font-extrabold tabular-nums">{toBRL(total)}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => alert('Seguir para checkout…')}
                            className="h-13 w-full rounded-full bg-[var(--loja)] text-base font-semibold text-[var(--loja-contraste)]"
                        >
                            Finalizar pedido
                        </button>
                        <button type="button" onClick={onLimpar}
                                className="h-11 w-full rounded-full text-base font-semibold text-tinta-media">
                            Limpar pedido
                        </button>
                    </div>
                )}
            </div>
        </dialog>
    )
}
