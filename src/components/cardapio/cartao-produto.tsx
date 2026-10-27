'use client'

import type { Produto } from '@/lib/types'
import { toBRL } from '@/lib/moeda'
import { FotoProduto } from './foto-produto'
import { SeletorQuantidade } from './seletor-quantidade'

type Props = {
    produto: Produto
    qtd: number
    onAdd: () => void
    onSub: () => void
}

export function CartaoProduto({ produto, qtd, onAdd, onSub }: Props) {
    return (
        <li className="flex gap-3 rounded-lg border border-borda bg-superficie p-3">
            <FotoProduto src={produto.foto_url} nome={produto.nome} tamanho={84} raio="rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="line-clamp-2 text-[17px] leading-[22px] font-bold">{produto.nome}</h3>
                {produto.descricao && (
                    <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-tinta-media">{produto.descricao}</p>
                )}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                    <span className="text-lg leading-[22px] font-extrabold tabular-nums text-[var(--loja-tinta)]">
                        {toBRL(produto.preco_centavos)}
                    </span>
                    <SeletorQuantidade nome={produto.nome} qtd={qtd} onAdd={onAdd} onSub={onSub} />
                </div>
            </div>
        </li>
    )
}
