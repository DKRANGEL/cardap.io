import Link from 'next/link'
import { ImageOffIcon, LayoutListIcon, PencilIcon, PlusIcon, StoreIcon } from 'lucide-react'
import { BOTAO_ESTADO, Estado } from '@/components/estado'
import { toBRL } from '@/lib/moeda'
import { carregarPainel } from '@/lib/painel-dados'
import { InterruptorProduto } from './interruptor-produto'

export const metadata = { title: 'Cardápio — cardap.io' }

type ProdutoDaLista = {
    id: string
    categoria_id: string | null
    nome: string
    preco_centavos: number
    foto_url: string | null
    ativo: boolean
}

function LinhaDoProduto({ produto }: { produto: ProdutoDaLista }) {
    return (
        <li className={`flex min-h-14 items-center gap-3 py-1.5 ${produto.ativo ? '' : 'opacity-60'}`}>
            <Link href={`/painel/cardapio/produto/${produto.id}`} aria-label={`Editar ${produto.nome}`}
                  className="flex min-h-14 min-w-0 flex-1 items-center gap-3">
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
                    <span className="block truncate text-[15px] leading-5 font-semibold">{produto.nome}</span>
                    <span className="flex items-center gap-2 text-sm leading-5 tabular-nums text-tinta-media">
                        {toBRL(produto.preco_centavos)}
                        {!produto.ativo && (
                            <span className="rounded-xs bg-superficie-marcada px-1.5 text-xs leading-5 font-semibold text-tinta-media">
                                Desativado
                            </span>
                        )}
                    </span>
                </span>
                <PencilIcon aria-hidden className="h-4 w-4 shrink-0 text-tinta-suave" />
            </Link>
            <InterruptorProduto id={produto.id} nome={produto.nome} ativo={produto.ativo} />
        </li>
    )
}

export default async function CardapioPainelPage() {
    const { supabase, loja } = await carregarPainel()

    if (!loja) {
        return (
            <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">Cardápio</h1>
                <Estado Icone={StoreIcon} titulo="Crie sua loja primeiro"
                        texto="Os produtos ficam dentro da sua loja. Comece pelos dados dela.">
                    <Link href="/painel/loja" className={BOTAO_ESTADO}>Criar minha loja</Link>
                </Estado>
            </main>
        )
    }

    const [categoriasRes, produtosRes] = await Promise.all([
        supabase.from('categorias').select('id, nome, ordem').eq('loja_id', loja.id).order('ordem', { ascending: true }),
        supabase
            .from('produtos')
            .select('id, categoria_id, nome, preco_centavos, foto_url, ativo')
            .eq('loja_id', loja.id)
            .order('ordem', { ascending: true }),
    ])
    if (categoriasRes.error) throw categoriasRes.error
    if (produtosRes.error) throw produtosRes.error

    const categorias = categoriasRes.data
    const produtos = produtosRes.data as ProdutoDaLista[]
    const porCategoria = new Map<string, ProdutoDaLista[]>()
    const soltos: ProdutoDaLista[] = []
    for (const produto of produtos) {
        if (produto.categoria_id) {
            porCategoria.set(produto.categoria_id, [...(porCategoria.get(produto.categoria_id) ?? []), produto])
        } else {
            soltos.push(produto)
        }
    }

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">Cardápio</h1>
                <p className="text-[15px] leading-[22px] text-tinta-media">
                    {produtos.length === 0
                        ? 'Crie uma categoria e o primeiro produto. Leva dois minutos.'
                        : `${produtos.length} ${produtos.length === 1 ? 'produto' : 'produtos'} em ${categorias.length} ${categorias.length === 1 ? 'categoria' : 'categorias'}.`}
                </p>
            </header>

            {categorias.length === 0 && soltos.length === 0 ? (
                <Estado Icone={LayoutListIcon} titulo="Você ainda não tem categorias"
                        texto="Crie a primeira pra organizar o cardápio. Leva um minuto.">
                    <Link href="/painel/cardapio/categoria/nova" className={BOTAO_ESTADO}>Criar categoria</Link>
                </Estado>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/painel/cardapio/produto/novo"
                              className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-acao text-base font-semibold text-acao-contraste">
                            <PlusIcon aria-hidden className="h-5 w-5" />
                            Produto
                        </Link>
                        <Link href="/painel/cardapio/categoria/nova"
                              className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-superficie-marcada text-base font-semibold text-tinta">
                            <PlusIcon aria-hidden className="h-5 w-5" />
                            Categoria
                        </Link>
                    </div>

                    <div className="flex flex-col gap-6">
                        {categorias.map((categoria) => {
                            const itens = porCategoria.get(categoria.id) ?? []
                            return (
                                <section key={categoria.id} aria-labelledby={`cat-${categoria.id}`}
                                         className="rounded-lg border border-borda">
                                    <div className="flex items-center gap-2 border-b border-borda px-4 py-2">
                                        <h2 id={`cat-${categoria.id}`} className="min-w-0 flex-1 truncate text-[17px] leading-[22px] font-bold">
                                            {categoria.nome}
                                        </h2>
                                        <Link href={`/painel/cardapio/categoria/${categoria.id}`}
                                              aria-label={`Editar a categoria ${categoria.nome}`}
                                              className="flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold text-tinta-media">
                                            <PencilIcon aria-hidden className="h-4 w-4" />
                                            Editar
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
                                        <ul className="divide-y divide-borda px-4">
                                            {itens.map((produto) => <LinhaDoProduto key={produto.id} produto={produto} />)}
                                        </ul>
                                    )}
                                </section>
                            )
                        })}

                        {soltos.length > 0 && (
                            <section aria-labelledby="cat-soltos" className="rounded-lg border border-aviso">
                                <div className="border-b border-borda px-4 py-2">
                                    <h2 id="cat-soltos" className="text-[17px] leading-[22px] font-bold">Sem categoria</h2>
                                    <p className="text-sm leading-5 text-aviso">
                                        Aparecem em “Outros” no cardápio. Abra cada um e escolha uma categoria.
                                    </p>
                                </div>
                                <ul className="divide-y divide-borda px-4">
                                    {soltos.map((produto) => <LinhaDoProduto key={produto.id} produto={produto} />)}
                                </ul>
                            </section>
                        )}
                    </div>
                </>
            )}
        </main>
    )
}
