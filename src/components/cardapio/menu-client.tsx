'use client'

import { SearchIcon, SearchXIcon, UtensilsIcon } from 'lucide-react'
import { BOTAO_ESTADO, Estado } from '@/components/estado'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Categoria, Loja, Produto } from '@/lib/types'
import { BarraPedido } from './barra-pedido'
import { Cabecalho } from './cabecalho'
import { CartaoProduto } from './cartao-produto'
import { ChipsCategoria } from './chips-categoria'
import { FolhaPedido } from './folha-pedido'

const TRAVA_APOS_CLIQUE_MS = 700
const SEM_CATEGORIA: Categoria = { id: 'sem-categoria', nome: 'Outros', ordem: Number.MAX_SAFE_INTEGER }

type Props = {
    loja: Loja
    categorias: Categoria[]
    produtos: Produto[]
}

export function MenuClient({ loja, categorias, produtos }: Props) {
    const [busca, setBusca] = useState('')
    const [carrinho, setCarrinho] = useState<Record<string, number>>({})
    const [folhaAberta, setFolhaAberta] = useState(false)
    const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
    const travado = useRef(false)
    const timerTrava = useRef<ReturnType<typeof setTimeout>>(undefined)

    const termoDaBusca = busca.trim()

    const porCategoria = useMemo(() => {
        const termo = termoDaBusca.toLowerCase()
        const mapa = new Map<string, Produto[]>()
        for (const p of produtos) {
            const combina = !termo || p.nome.toLowerCase().includes(termo) || p.descricao?.toLowerCase().includes(termo)
            if (!combina) continue
            const chave = p.categoria_id ?? SEM_CATEGORIA.id
            mapa.set(chave, [...(mapa.get(chave) ?? []), p])
        }
        return mapa
    }, [termoDaBusca, produtos])

    const categoriasComOutros = produtos.some((p) => !p.categoria_id) ? [...categorias, SEM_CATEGORIA] : categorias
    const categoriasVisiveis = categoriasComOutros.filter((c) => (porCategoria.get(c.id)?.length ?? 0) > 0)
    const idsVisiveis = categoriasVisiveis.map((c) => c.id).join(',')
    const ativaId = categoriasVisiveis.some((c) => c.id === categoriaAtiva)
        ? categoriaAtiva
        : (categoriasVisiveis[0]?.id ?? null)

    useEffect(() => {
        const ids = idsVisiveis.split(',').filter(Boolean)
        if (ids.length === 0) return

        const naFaixa = new Set<string>()
        const primeiraNaFaixa = () => ids.find((id) => naFaixa.has(id))
        // A última seção costuma ser curta demais para chegar à faixa do observador,
        // então no fim da página ela vira a ativa por regra própria.
        let noFim = false

        const observador = new IntersectionObserver(
            (entradas) => {
                for (const entrada of entradas) {
                    const id = entrada.target.id.replace('cat-', '')
                    if (entrada.isIntersecting) naFaixa.add(id)
                    else naFaixa.delete(id)
                }
                if (travado.current || noFim) return
                const primeira = primeiraNaFaixa()
                if (primeira) setCategoriaAtiva(primeira)
            },
            { rootMargin: '-130px 0px -70% 0px' },
        )

        for (const id of ids) {
            const secao = document.getElementById(`cat-${id}`)
            if (secao) observador.observe(secao)
        }

        const aoRolar = () => {
            if (travado.current) return
            const agoraNoFim = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
            if (agoraNoFim === noFim) return
            noFim = agoraNoFim
            const alvo = noFim ? ids[ids.length - 1] : primeiraNaFaixa()
            if (alvo) setCategoriaAtiva(alvo)
        }
        window.addEventListener('scroll', aoRolar, { passive: true })

        return () => {
            observador.disconnect()
            window.removeEventListener('scroll', aoRolar)
        }
    }, [idsVisiveis])

    useEffect(() => () => clearTimeout(timerTrava.current), [])

    const irParaCategoria = (id: string) => {
        setCategoriaAtiva(id)
        travado.current = true
        clearTimeout(timerTrava.current)
        timerTrava.current = setTimeout(() => {
            travado.current = false
        }, TRAVA_APOS_CLIQUE_MS)

        const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        document.getElementById(`cat-${id}`)?.scrollIntoView({
            behavior: reduzirMovimento ? 'auto' : 'smooth',
            block: 'start',
        })
    }

    const itens = Object.entries(carrinho).flatMap(([id, qtd]) => {
        const produto = produtos.find((p) => p.id === id)
        return produto ? [{ produto, qtd }] : []
    })
    const totalItens = itens.reduce((soma, item) => soma + item.qtd, 0)
    const total = itens.reduce((soma, item) => soma + item.produto.preco_centavos * item.qtd, 0)

    const adicionar = (id: string) => setCarrinho((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
    const remover = (id: string) =>
        setCarrinho((c) => {
            if (!c[id]) return c
            const proximo = { ...c }
            proximo[id] -= 1
            if (proximo[id] <= 0) delete proximo[id]
            return proximo
        })

    return (
        <div className="mx-auto min-h-dvh w-full max-w-[520px] bg-superficie text-tinta">
            <Cabecalho
                nome={loja.nome}
                logoUrl={loja.logo_url}
                totalItens={totalItens}
                onAbrirPedido={() => setFolhaAberta(true)}
            />

            {produtos.length === 0 ? (
                <main>
                    <Estado Icone={UtensilsIcon} titulo="Esse cardápio ainda está sendo montado"
                            texto="A loja ainda não publicou os produtos. Volte daqui a pouco." />
                </main>
            ) : (
            <>
            <div className="px-4 py-3">
                <div className="relative">
                    <SearchIcon aria-hidden
                                className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-carvao-500" />
                    <input
                        type="search"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar no cardápio"
                        aria-label="Buscar no cardápio"
                        enterKeyHint="search"
                        autoComplete="off"
                        className="h-12 w-full appearance-none rounded-md border border-borda bg-superficie-sutil pr-4 pl-11 text-base text-tinta placeholder:text-tinta-suave focus:border-borda-forte"
                    />
                </div>
            </div>

            <ChipsCategoria categorias={categoriasVisiveis} ativaId={ativaId} onSelecionar={irParaCategoria} />

            <main className={totalItens > 0 ? 'pb-[calc(96px+env(safe-area-inset-bottom))]' : 'pb-8'}>
                {categoriasVisiveis.length === 0 && (
                    <Estado Icone={SearchXIcon} titulo={`Nada encontrado para “${termoDaBusca}”`}
                            texto="Tente outra palavra ou veja o cardápio inteiro.">
                        <button type="button" onClick={() => setBusca('')} className={BOTAO_ESTADO}>
                            Ver o cardápio inteiro
                        </button>
                    </Estado>
                )}
                {categoriasVisiveis.map((categoria) => (
                    <section key={categoria.id} id={`cat-${categoria.id}`} aria-labelledby={`titulo-${categoria.id}`}
                             className="scroll-mt-32 px-4 pt-5">
                        <h2 id={`titulo-${categoria.id}`} className="text-[17px] leading-[22px] font-bold">
                            {categoria.nome}
                        </h2>
                        <ul className="mt-3 flex flex-col gap-3">
                            {(porCategoria.get(categoria.id) ?? []).map((produto) => (
                                <CartaoProduto
                                    key={produto.id}
                                    produto={produto}
                                    qtd={carrinho[produto.id] ?? 0}
                                    onAdd={() => adicionar(produto.id)}
                                    onSub={() => remover(produto.id)}
                                />
                            ))}
                        </ul>
                    </section>
                ))}
            </main>
            </>
            )}

            {totalItens > 0 && <BarraPedido totalItens={totalItens} total={total} onAbrir={() => setFolhaAberta(true)} />}

            <FolhaPedido
                aberto={folhaAberta}
                onFechar={() => setFolhaAberta(false)}
                itens={itens}
                total={total}
                onAdd={adicionar}
                onSub={remover}
                onLimpar={() => {
                    setCarrinho({})
                    setFolhaAberta(false)
                }}
            />
        </div>
    )
}
