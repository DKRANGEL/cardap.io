import type { ReactNode } from 'react'
import Link from 'next/link'
import { ImageOffIcon, PencilIcon } from 'lucide-react'
import { toBRL } from '@/lib/moeda'
import { InterruptorProduto } from './interruptor-produto'

export type ProdutoDaLista = {
    id: string
    categoria_id: string | null
    nome: string
    preco_centavos: number
    foto_url: string | null
    ativo: boolean
}

type Props = {
    produto: ProdutoDaLista
    alca?: ReactNode
    mover?: ReactNode
}

export function LinhaDoProduto({ produto, alca, mover }: Props) {
    return (
        <div className={`flex min-h-14 items-center gap-2 py-1.5 ${produto.ativo ? '' : 'opacity-60'}`}>
            {alca}
            <Link href={`/painel/cardapio/produto/${produto.id}`} aria-label={`Editar ${produto.nome}`}
                  className="flex min-h-14 min-w-0 flex-1 items-center gap-2">
                {produto.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- miniatura de 44px; o otimizador custaria mais do que a imagem
                    <img src={produto.foto_url} alt="" width={44} height={44} loading="lazy"
                         className="h-11 w-11 shrink-0 rounded-sm bg-superficie-marcada object-cover" />
                ) : (
                    <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-superficie-marcada">
                        <ImageOffIcon className="h-5 w-5 text-carvao-500" />
                    </span>
                )}
                <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[15px] leading-5 font-semibold break-words">{produto.nome}</span>
                    <span className="flex items-center gap-2 text-sm leading-5 tabular-nums text-tinta-media">
                        {toBRL(produto.preco_centavos)}
                        {!produto.ativo && (
                            <span className="rounded-xs bg-superficie-marcada px-1.5 text-xs leading-5 font-semibold text-tinta-media">
                                Desativado
                            </span>
                        )}
                    </span>
                </span>
                {!mover && <PencilIcon aria-hidden className="h-4 w-4 shrink-0 text-tinta-suave" />}
            </Link>
            {mover}
            <InterruptorProduto id={produto.id} nome={produto.nome} ativo={produto.ativo} />
        </div>
    )
}
