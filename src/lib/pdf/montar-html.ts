import type { SupabaseClient } from '@supabase/supabase-js'
import { derivarCorDaLoja } from '../cor-da-loja'
import { whatsappParaExibicao } from '../validacao/loja'
import { agruparProdutos } from './agrupar'
import { cssDasFontes } from './fontes'
import { fotoEmDataUri, fotosEmLote } from './imagens'
import { TEMPLATE_PADRAO, TEMPLATES, temTemplate } from './templates'

export type LojaParaPdf = {
    id: string
    nome: string
    whatsapp: string
    cor_primaria: string | null
    logo_url: string | null
}

// Busca os dados da loja, embute fotos e fontes e entrega um HTML sem nenhuma dependência de rede.
export async function montarHtmlDoCardapio(supabase: SupabaseClient, loja: LojaParaPdf, templateId = TEMPLATE_PADRAO) {
    if (!temTemplate(templateId)) throw new Error('Modelo de PDF desconhecido.')

    const [categoriasRes, produtosRes] = await Promise.all([
        supabase.from('categorias').select('id, nome, ordem').eq('loja_id', loja.id),
        supabase
            .from('produtos')
            .select('categoria_id, nome, descricao, preco_centavos, foto_url, ordem')
            .eq('loja_id', loja.id)
            .eq('ativo', true),
    ])
    if (categoriasRes.error) throw categoriasRes.error
    if (produtosRes.error) throw produtosRes.error

    const [fotos, logo, fontes] = await Promise.all([
        fotosEmLote(produtosRes.data.map((p) => p.foto_url as string | null), loja.id),
        fotoEmDataUri(loja.logo_url, loja.id),
        cssDasFontes(),
    ])

    const { cor, contraste, tinta } = derivarCorDaLoja(loja.cor_primaria ?? '#bd3f0d')
    const secoes = agruparProdutos(categoriasRes.data, produtosRes.data, (url) => (url ? (fotos.get(url) ?? null) : null))

    return TEMPLATES[templateId](
        { loja: { nome: loja.nome, whatsapp: whatsappParaExibicao(loja.whatsapp), cor, contraste, tinta, logo }, secoes },
        { fontes },
    )
}
