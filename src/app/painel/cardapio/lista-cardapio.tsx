'use client'

import Link from 'next/link'
import { PencilIcon } from 'lucide-react'
import { reordenarCategorias, reordenarProdutos } from './actions-ordem'
import { LinhaDoProduto, type ProdutoDaLista } from './linha-produto'
import { ListaOrdenavel } from './lista-ordenavel'

type Categoria = { id: string; nome: string }

type Props = {
    categorias: Categoria[]
    produtosPorCategoria: Record<string, ProdutoDaLista[]>
}

export function ListaCardapio({ categorias, produtosPorCategoria }: Props) {
    return (
        <ListaOrdenavel
            itens={categorias}
            como="div"
            className="flex flex-col gap-6"
            itemClassName="rounded-lg border border-borda bg-superficie"
            aoSalvar={reordenarCategorias}
            renderizar={(categoria, { alca, mover }) => {
                const itens = produtosPorCategoria[categoria.id] ?? []
                return (
                    <section aria-labelledby={`cat-${categoria.id}`}>
                        <div className="flex items-center gap-1 border-b border-borda py-1 pr-2 pl-1">
                            {alca}
                            <h2 id={`cat-${categoria.id}`} className="min-w-0 flex-1 truncate text-[17px] leading-[22px] font-bold">
                                {categoria.nome}
                            </h2>
                            {mover}
                            <Link href={`/painel/cardapio/categoria/${categoria.id}`}
                                  aria-label={`Editar a categoria ${categoria.nome}`}
                                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-tinta-media">
                                <PencilIcon aria-hidden className="h-4 w-4" />
                            </Link>
                        </div>
                        {itens.length === 0 ? (
                            <div className="flex flex-col items-start gap-1 px-4 py-3">
                                <p className="text-sm leading-5 text-tinta-media">Nenhum produto nessa categoria ainda.</p>
                                <Link href={`/painel/cardapio/produto/novo?categoria=${categoria.id}`}
                                      className="flex h-11 items-center text-[15px] font-semibold text-acao">
                                    Adicionar produto
                                </Link>
                            </div>
                        ) : (
                            <ListaOrdenavel
                                itens={itens}
                                como="ul"
                                className="divide-y divide-borda pr-3 pl-1"
                                aoSalvar={(ids) => reordenarProdutos(categoria.id, ids)}
                                renderizar={(produto, controles) => (
                                    <LinhaDoProduto produto={produto} alca={controles.alca} mover={controles.mover} />
                                )}
                            />
                        )}
                    </section>
                )
            }}
        />
    )
}
