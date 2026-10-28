import { notFound } from 'next/navigation'
import { z } from 'zod'
import { carregarPainel } from '@/lib/painel-dados'
import { NOME_CATEGORIA_MAX } from '@/lib/validacao/categoria'
import { ExcluirCategoria } from '../../excluir-categoria'
import { FormularioCategoria } from '../../formulario-categoria'

export const metadata = { title: 'Editar categoria — cardap.io' }

type Props = {
    params: Promise<{ id: string }>
}

export default async function EditarCategoriaPage({ params }: Props) {
    const { id } = await params
    if (!z.uuid().safeParse(id).success) notFound()

    const { supabase, loja } = await carregarPainel()
    if (!loja) notFound()

    const { data: categoria, error } = await supabase
        .from('categorias')
        .select('id, nome')
        .eq('id', id)
        .eq('loja_id', loja.id)
        .maybeSingle()

    if (error) throw error
    if (!categoria) notFound()

    const { count, error: erroConta } = await supabase
        .from('produtos')
        .select('id', { count: 'exact', head: true })
        .eq('categoria_id', categoria.id)
        .eq('loja_id', loja.id)
    if (erroConta) throw erroConta

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
            <h1 className="text-xl leading-[26px] font-bold tracking-tight">Editar categoria</h1>

            <FormularioCategoria categoria={{ id: categoria.id, nome: categoria.nome }} limite={NOME_CATEGORIA_MAX} />

            <section aria-labelledby="titulo-excluir" className="mt-2 flex flex-col gap-3 border-t border-borda pt-6">
                <h2 id="titulo-excluir" className="text-[17px] leading-[22px] font-bold">Excluir categoria</h2>
                <p className="text-sm leading-5 text-tinta-media">
                    Os produtos dela não são apagados: ficam sem categoria e aparecem em “Outros”.
                </p>
                <ExcluirCategoria id={categoria.id} nome={categoria.nome} produtos={count ?? 0} />
            </section>
        </main>
    )
}
