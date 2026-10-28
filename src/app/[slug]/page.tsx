import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { derivarCorDaLoja } from '@/lib/cor-da-loja'
import { MenuClient } from '@/components/cardapio/menu-client'

const COR_PADRAO = '#bd3f0d'

type Props = {
    params: Promise<{ slug: string }>
}

async function getLoja(slug: string) {
    const supabase = await createClient()

    const { data: loja, error } = await supabase
        .from('lojas')
        .select('id, slug, nome, whatsapp, cor_primaria, cor_contraste, cor_tinta, logo_url')
        .eq('slug', slug)
        .eq('ativo', true)
        .maybeSingle()

    if (error) throw error
    if (!loja) return null

    const [categoriasRes, produtosRes] = await Promise.all([
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

    if (categoriasRes.error) throw categoriasRes.error
    if (produtosRes.error) throw produtosRes.error

    return { loja, categorias: categoriasRes.data ?? [], produtos: produtosRes.data ?? [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    let data
    try {
        data = await getLoja(slug)
    } catch {
        return {}
    }
    if (!data) return { title: 'Cardápio não encontrado — cardap.io' }

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

    const { cor, contraste, tinta } = derivarCorDaLoja(data.loja.cor_primaria ?? COR_PADRAO)

    const estiloLoja = {
        '--loja': cor,
        '--loja-contraste': data.loja.cor_contraste ?? contraste,
        '--loja-tinta': data.loja.cor_tinta ?? tinta,
    } as CSSProperties

    return (
        <div style={estiloLoja}>
            <MenuClient loja={data.loja} categorias={data.categorias} produtos={data.produtos} />
        </div>
    )
}
