import Link from 'next/link'
import { LayoutListIcon, StoreIcon } from 'lucide-react'
import { BOTAO_ESTADO, Estado } from '@/components/estado'
import { carregarPainel } from '@/lib/painel-dados'
import { FormularioProduto } from '../../formulario-produto'

export const metadata = { title: 'Novo produto — cardap.io' }

type Props = {
    searchParams: Promise<{ categoria?: string }>
}

export default async function NovoProdutoPage({ searchParams }: Props) {
    const { supabase, loja } = await carregarPainel()
    const { categoria } = await searchParams

    if (!loja) {
        return (
            <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">Novo produto</h1>
                <Estado Icone={StoreIcon} titulo="Crie sua loja primeiro"
                        texto="Os produtos ficam dentro da sua loja. Comece pelos dados dela.">
                    <Link href="/painel/loja" className={BOTAO_ESTADO}>Criar minha loja</Link>
                </Estado>
            </main>
        )
    }

    const { data: categorias, error } = await supabase
        .from('categorias')
        .select('id, nome')
        .eq('loja_id', loja.id)
        .order('ordem', { ascending: true })
    if (error) throw error

    if (categorias.length === 0) {
        return (
            <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">Novo produto</h1>
                <Estado Icone={LayoutListIcon} titulo="Crie uma categoria primeiro"
                        texto="Todo produto fica dentro de uma categoria, como Lanches ou Bebidas.">
                    <Link href="/painel/cardapio/categoria/nova" className={BOTAO_ESTADO}>Criar categoria</Link>
                </Estado>
            </main>
        )
    }

    const categoriaInicial = categorias.some((c) => c.id === categoria) ? categoria : undefined

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
            <h1 className="text-xl leading-[26px] font-bold tracking-tight">Novo produto</h1>
            <FormularioProduto categorias={categorias} categoriaInicial={categoriaInicial} />
        </main>
    )
}
