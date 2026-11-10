'use client'

import { useRef, useState, useTransition, type PointerEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircleIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { AlcaArraste } from '@/components/alca-arraste'
import { moverItem } from '@/lib/reordenar'
import type { ResultadoOrdem } from './actions-ordem'

type Item = { id: string; nome: string }

type Controles = { alca: ReactNode; mover: ReactNode }

type Props<T extends Item> = {
    itens: T[]
    como: 'ul' | 'div'
    className?: string
    itemClassName?: string
    aoSalvar: (ids: string[]) => Promise<ResultadoOrdem>
    renderizar: (item: T, controles: Controles) => ReactNode
}

type Arrasto = { de: number; para: number; dy: number }

export function ListaOrdenavel<T extends Item>({ itens, como, className, itemClassName, aoSalvar, renderizar }: Props<T>) {
    const router = useRouter()
    const [pendente, startTransition] = useTransition()
    const [lista, setLista] = useState(itens)
    const [origem, setOrigem] = useState(itens)
    const [arrasto, setArrasto] = useState<Arrasto | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const [aviso, setAviso] = useState('')
    const recipiente = useRef<HTMLElement | null>(null)
    const geometria = useRef<{ topo: number; base: number; altura: number }[]>([])
    const inicioY = useRef(0)

    // Quando o servidor devolve uma lista nova (após salvar ou recarregar), ela vira a verdade.
    if (itens !== origem) {
        setOrigem(itens)
        setLista(itens)
    }

    const salvar = (nova: T[], anterior: T[], movido: T) => {
        setLista(nova)
        setErro(null)
        setAviso(`${movido.nome} movido para a posição ${nova.findIndex((i) => i.id === movido.id) + 1} de ${nova.length}.`)
        startTransition(async () => {
            try {
                const resultado = await aoSalvar(nova.map((i) => i.id))
                if (!resultado.ok) {
                    setLista(anterior)
                    setErro(resultado.erro)
                }
                router.refresh()
            } catch {
                setLista(anterior)
                setErro('Sem conexão. A lista voltou como estava. Tente de novo.')
            }
        })
    }

    const moverPara = (de: number, para: number) => {
        if (para < 0 || para >= lista.length || de === para) return
        salvar(moverItem(lista, de, para), lista, lista[de])
    }

    const iniciar = (e: PointerEvent<HTMLButtonElement>, indice: number) => {
        if (pendente || (e.pointerType === 'mouse' && e.button !== 0)) return
        const filhos = Array.from(recipiente.current?.querySelectorAll(':scope > [data-item]') ?? [])
        geometria.current = filhos.map((el) => {
            const r = el.getBoundingClientRect()
            return { topo: r.top, base: r.bottom, altura: r.height }
        })
        inicioY.current = e.clientY
        e.currentTarget.setPointerCapture(e.pointerId)
        setArrasto({ de: indice, para: indice, dy: 0 })
    }

    const arrastar = (e: PointerEvent<HTMLButtonElement>) => {
        if (!arrasto) return
        const dy = e.clientY - inicioY.current
        const g = geometria.current
        const centro = (g[arrasto.de].topo + g[arrasto.de].base) / 2 + dy
        let para = arrasto.de
        g.forEach((caixa, i) => {
            if (centro >= caixa.topo && centro <= caixa.base) para = i
        })
        if (centro < g[0].topo) para = 0
        if (centro > g[g.length - 1].base) para = g.length - 1
        setArrasto({ de: arrasto.de, para, dy })
    }

    const terminar = (e: PointerEvent<HTMLButtonElement>, confirmar: boolean) => {
        if (!arrasto) return
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
        const { de, para } = arrasto
        setArrasto(null)
        if (confirmar) moverPara(de, para)
    }

    const deslocamento = (indice: number) => {
        if (!arrasto) return 0
        const { de, para, dy } = arrasto
        if (indice === de) return dy
        const g = geometria.current
        const passo = g[de].altura + (g.length > 1 ? Math.max(g[1].topo - g[0].base, 0) : 0)
        if (de < para && indice > de && indice <= para) return -passo
        if (de > para && indice >= para && indice < de) return passo
        return 0
    }

    const Recipiente = como
    const Filho = como === 'ul' ? 'li' : 'div'
    const botao = 'flex h-7 w-11 items-center justify-center rounded-sm text-tinta-media disabled:opacity-30'

    return (
        <>
            {erro && (
                <div role="alert" className="mb-2 flex items-start gap-2 rounded-md bg-perigo-suave p-3 text-sm leading-5 text-perigo">
                    <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{erro}</p>
                </div>
            )}
            <p role="status" aria-live="polite" className="sr-only">{aviso}</p>
            <Recipiente ref={recipiente as never} className={className}>
                {lista.map((item, i) => {
                    const arrastado = arrasto?.de === i
                    return (
                        <Filho
                            key={item.id}
                            data-item
                            style={{ transform: arrasto ? `translateY(${deslocamento(i)}px)` : undefined }}
                            className={`${itemClassName ?? ''} ${arrastado ? 'relative z-10 bg-superficie shadow-folha' : 'motion-safe:transition-transform'}`}
                        >
                            {renderizar(item, {
                                alca: (
                                    <AlcaArraste
                                        nome={item.nome}
                                        arrastando={arrastado}
                                        onPointerDown={(e) => iniciar(e, i)}
                                        onPointerMove={arrastar}
                                        onPointerUp={(e) => terminar(e, true)}
                                        onPointerCancel={(e) => terminar(e, false)}
                                    />
                                ),
                                mover: (
                                    <div className="flex shrink-0 flex-col">
                                        <button type="button" className={botao} disabled={pendente || i === 0}
                                                aria-label={`Subir ${item.nome}`} onClick={() => moverPara(i, i - 1)}>
                                            <ChevronUpIcon aria-hidden className="h-4 w-4" />
                                        </button>
                                        <button type="button" className={botao} disabled={pendente || i === lista.length - 1}
                                                aria-label={`Descer ${item.nome}`} onClick={() => moverPara(i, i + 1)}>
                                            <ChevronDownIcon aria-hidden className="h-4 w-4" />
                                        </button>
                                    </div>
                                ),
                            })}
                        </Filho>
                    )
                })}
            </Recipiente>
        </>
    )
}
