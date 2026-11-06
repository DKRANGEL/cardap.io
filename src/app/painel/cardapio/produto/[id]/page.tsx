import { notFound } from 'next/navigation'
import { z } from 'zod'
import { carregarPainel } from '@/lib/painel-dados'
import { ExcluirProduto } from '../../excluir-produto'
import { FormularioProduto } from '../../formulario-produto'

export const metadata = { title: 'Editar produto — cardap.io' }

type Props = {
    params: Promise<{ id: string }>
}

export default async function EditarProdutoPage({ params }: Props) {
    const { id } = await params
    if (!z.uuid().safeParse(id).success) notFound()

    const { supabase, loja } = await carregarPainel()
    if (!loja) notFound()

    const [produtoRes, categoriasRes] = await Promise.all([
        supabase
            .from('produtos')
            .select('id, nome, descricao, preco_centavos, categoria_id, foto_url, ativo')
            .eq('id', id)
            .eq('loja_id', loja.id)
            .maybeSingle(),
        supabase.from('categorias').select('id, nome').eq('loja_id', loja.id).order('ordem', { ascending: true }),
    ])
    if (produtoRes.error) throw produtoRes.error
    if (categoriasRes.error) throw categoriasRes.error
    if (!produtoRes.data) notFound()

    const produto = produtoRes.data

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
            <h1 className="text-xl leading-[26px] font-bold tracking-tight">Editar produto</h1>

            <FormularioProduto
                produto={{
                    id: produto.id,
                    nome: produto.nome,
                    descricao: produto.descricao,
                    preco_centavos: produto.preco_centavos,
                    categoria_id: produto.categoria_id,
                    foto_url: produto.foto_url,
                }}
                categorias={categoriasRes.data}
            />

            <section aria-labelledby="titulo-excluir" className="mt-2 flex flex-col gap-3 border-t border-borda pt-6">
                <h2 id="titulo-excluir" className="text-[17px] leading-[22px] font-bold">Excluir produto</h2>
                <p className="text-sm leading-5 text-tinta-media">
                    Excluir apaga o produto e a foto. Para só tirar do cardápio por um tempo, use o interruptor na lista.
                </p>
                <ExcluirProduto id={produto.id} nome={produto.nome} ativo={produto.ativo} />
            </section>
        </main>
    )
}
