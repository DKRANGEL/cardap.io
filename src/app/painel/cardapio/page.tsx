import Link from 'next/link'
import { InfoIcon, LayoutListIcon, PencilIcon, PlusIcon, StoreIcon } from 'lucide-react'
import { BOTAO_ESTADO, Estado } from '@/components/estado'
import { carregarPainel } from '@/lib/painel-dados'

export const metadata = { title: 'Cardápio — cardap.io' }

const plural = (n: number) => `${n} ${n === 1 ? 'produto' : 'produtos'}`

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
        supabase.from('produtos').select('categoria_id').eq('loja_id', loja.id),
    ])
    if (categoriasRes.error) throw categoriasRes.error
    if (produtosRes.error) throw produtosRes.error

    const categorias = categoriasRes.data
    const porCategoria = new Map<string, number>()
    let semCategoria = 0
    for (const { categoria_id } of produtosRes.data) {
        if (categoria_id) porCategoria.set(categoria_id, (porCategoria.get(categoria_id) ?? 0) + 1)
        else semCategoria += 1
    }

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">Cardápio</h1>
                <p className="text-[15px] leading-[22px] text-tinta-media">
                    Separe o que você vende em categorias, como Lanches e Bebidas.
                </p>
            </header>

            {categorias.length === 0 ? (
                <Estado Icone={LayoutListIcon} titulo="Você ainda não tem categorias"
                        texto="Crie a primeira pra organizar o cardápio. Leva um minuto.">
                    <Link href="/painel/cardapio/categoria/nova" className={BOTAO_ESTADO}>Criar categoria</Link>
                </Estado>
            ) : (
                <>
                    <Link href="/painel/cardapio/categoria/nova"
                          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-acao text-base font-semibold text-acao-contraste">
                        <PlusIcon aria-hidden className="h-5 w-5" />
                        Nova categoria
                    </Link>

                    <ul aria-label="Categorias" className="flex flex-col gap-3">
                        {categorias.map((categoria) => (
                            <li key={categoria.id} className="flex items-center gap-3 rounded-lg border border-borda p-3">
                                <div className="min-w-0 flex-1">
                                    <h2 className="truncate text-[17px] leading-[22px] font-bold">{categoria.nome}</h2>
                                    <p className="text-sm leading-5 tabular-nums text-tinta-media">
                                        {plural(porCategoria.get(categoria.id) ?? 0)}
                                    </p>
                                </div>
                                <Link href={`/painel/cardapio/categoria/${categoria.id}`}
                                      aria-label={`Editar a categoria ${categoria.nome}`}
                                      className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-superficie-marcada px-4 text-[15px] font-semibold">
                                    <PencilIcon aria-hidden className="h-4 w-4" />
                                    Editar
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {semCategoria > 0 && (
                <div role="note" className="flex gap-3 rounded-md bg-aviso-suave p-4 text-[15px] leading-[22px] text-aviso">
                    <InfoIcon aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>
                        {semCategoria === 1
                            ? '1 produto está sem categoria e aparece em “Outros” no seu cardápio.'
                            : `${semCategoria} produtos estão sem categoria e aparecem em “Outros” no seu cardápio.`}
                    </p>
                </div>
            )}

            <p className="text-sm leading-5 text-tinta-suave">Em breve você cadastra os produtos aqui.</p>
        </main>
    )
}
