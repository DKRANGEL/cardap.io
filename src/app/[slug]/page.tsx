import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { MenuClient } from '@/components/cardapio/menu-client'

type Props = {
    params: Promise<{ slug: string }>
}

async function getLoja(slug: string) {
    const supabase = await createClient()

    const { data: loja } = await supabase
        .from('lojas')
        .select('id, slug, nome, whatsapp, cor_primaria, logo_url')
        .eq('slug', slug)
        .eq('ativo', true)
        .maybeSingle()

    if (!loja) return null

    const [{ data: categorias }, { data: produtos }] = await Promise.all([
        supabase
            .from('categorias')
            .select('id, nome, ordem')
            .eq('loja_id', loja.id)
            .order('ordem', { ascending: true }),
        supabase
            .from('produtos')
            .select('id, categoria_id, nome, descricao, preco_centavos, foto_url, ordem')
            .eq('loja_id', loja.id)
            .eq('ativo', true)
            .order('ordem', { ascending: true }),
    ])

    return { loja, categorias: categorias ?? [], produtos: produtos ?? [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const data = await getLoja(slug)
    if (!data) return {}

    return {
        title: data.loja.nome,
        description: `Cardápio digital de ${data.loja.nome}`,
        openGraph: {
            title: data.loja.nome,
            description: `Cardápio digital de ${data.loja.nome}`,
            images: data.loja.logo_url ? [data.loja.logo_url] : undefined,
        },
    }
}

export default async function CardapioPage({ params }: Props) {
    const { slug } = await params
    const data = await getLoja(slug)

    if (!data) notFound()

    return <MenuClient loja={data.loja} categorias={data.categorias} produtos={data.produtos} />
}
