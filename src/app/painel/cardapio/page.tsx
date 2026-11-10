import Link from 'next/link'
import { LayoutListIcon, PlusIcon, StoreIcon } from 'lucide-react'
import { BOTAO_ESTADO, Estado } from '@/components/estado'
import { carregarPainel } from '@/lib/painel-dados'
import { ListaCardapio } from './lista-cardapio'
import { LinhaDoProduto, type ProdutoDaLista } from './linha-produto'

export const metadata = { title: 'Cardápio — cardap.io' }

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

    const categorias = categoriasRes.data.map((c) => ({ id: c.id as string, nome: c.nome as string }))
    const produtos = produtosRes.data as ProdutoDaLista[]
    const porCategoria: Record<string, ProdutoDaLista[]> = {}
    const soltos: ProdutoDaLista[] = []
    for (const produto of produtos) {
        if (produto.categoria_id) {
            ;(porCategoria[produto.categoria_id] ??= []).push(produto)
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
                        <ListaCardapio categorias={categorias} produtosPorCategoria={porCategoria} />

                        {soltos.length > 0 && (
                            <section aria-labelledby="cat-soltos" className="rounded-lg border border-aviso">
                                <div className="border-b border-borda px-4 py-2">
                                    <h2 id="cat-soltos" className="text-[17px] leading-[22px] font-bold">Sem categoria</h2>
                                    <p className="text-sm leading-5 text-aviso">
                                        Aparecem em “Outros” no cardápio. Abra cada um e escolha uma categoria.
                                    </p>
                                </div>
                                <ul className="divide-y divide-borda px-4">
                                    {soltos.map((produto) => (
                                        <li key={produto.id}><LinhaDoProduto produto={produto} /></li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                </>
            )}
        </main>
    )
}
