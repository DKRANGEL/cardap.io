'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { contextoDaLoja } from '@/lib/acao-da-loja'
import { caminhoDaFoto, urlPublicaDaFoto } from '@/lib/foto-do-bucket'
import { produtoSchema, type ProdutoCampos } from '@/lib/validacao/produto'

export type ResultadoProduto =
    | { ok: true; id: string; lojaId: string }
    | { ok: false; erro?: string; erros?: Partial<Record<ProdutoCampos, string>> }

export type ResultadoSimples = { ok: true } | { ok: false; erro: string }

const NAO_ENCONTRADO = 'Esse produto não existe mais. Volte à lista e confira.'
const FALHA_AO_SALVAR = 'Não foi possível salvar o produto. Tente de novo.'

const contexto = () => contextoDaLoja('Crie sua loja antes de cadastrar produtos.')

function lerCampos(formData: FormData) {
    const parsed = produtoSchema.safeParse({
        nome: formData.get('nome'),
        descricao: formData.get('descricao') ?? '',
        categoria_id: formData.get('categoria_id'),
        preco: formData.get('preco'),
    })
    if (parsed.success) return { dados: parsed.data }

    const { fieldErrors } = z.flattenError(parsed.error)
    const erros: Partial<Record<ProdutoCampos, string>> = {}
    for (const [campo, mensagens] of Object.entries(fieldErrors)) {
        if (mensagens?.[0]) erros[campo as ProdutoCampos] = mensagens[0]
    }
    return { erros }
}

type Supabase = Extract<Awaited<ReturnType<typeof contexto>>, { supabase: unknown }>['supabase']

async function categoriaDaLoja(supabase: Supabase, lojaId: string, categoriaId: string) {
    const { data, error } = await supabase
        .from('categorias')
        .select('id')
        .eq('id', categoriaId)
        .eq('loja_id', lojaId)
        .maybeSingle()
    return { existe: Boolean(data), falhou: Boolean(error) }
}

async function apagarFotos(supabase: Supabase, lojaId: string, urls: (string | null)[]) {
    const caminhos = urls.map((u) => caminhoDaFoto(u, lojaId)).filter((c): c is string => c !== null)
    if (caminhos.length === 0) return
    // Falhar aqui não pode desfazer a edição já salva; sobra um arquivo solto, que não aparece em lugar nenhum.
    await supabase.storage.from('fotos').remove(caminhos).catch(() => undefined)
}

export async function criarProduto(formData: FormData): Promise<ResultadoProduto> {
    const lido = lerCampos(formData)
    if ('erros' in lido) return { ok: false, erros: lido.erros }

    const ctx = await contexto()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const categoria = await categoriaDaLoja(ctx.supabase, ctx.lojaId, lido.dados.categoria_id)
    if (categoria.falhou) return { ok: false, erro: FALHA_AO_SALVAR }
    if (!categoria.existe) return { ok: false, erros: { categoria_id: 'Essa categoria não existe mais. Escolha outra.' } }

    const { data: irmaos, error: erroIrmaos } = await ctx.supabase
        .from('produtos')
        .select('ordem')
        .eq('loja_id', ctx.lojaId)
        .eq('categoria_id', lido.dados.categoria_id)
    if (erroIrmaos) return { ok: false, erro: FALHA_AO_SALVAR }

    const proximaOrdem = irmaos.reduce((maior, p) => Math.max(maior, p.ordem), 0) + 1
    const { data, error } = await ctx.supabase
        .from('produtos')
        .insert({
            loja_id: ctx.lojaId,
            categoria_id: lido.dados.categoria_id,
            nome: lido.dados.nome,
            descricao: lido.dados.descricao,
            preco_centavos: lido.dados.preco,
            ordem: proximaOrdem,
        })
        .select('id')
        .single()

    if (error) return { ok: false, erro: FALHA_AO_SALVAR }

    revalidatePath('/painel/cardapio')
    return { ok: true, id: data.id, lojaId: ctx.lojaId }
}

export async function editarProduto(id: string, formData: FormData): Promise<ResultadoProduto> {
    if (!z.uuid().safeParse(id).success) return { ok: false, erro: NAO_ENCONTRADO }

    const lido = lerCampos(formData)
    if ('erros' in lido) return { ok: false, erros: lido.erros }

    const ctx = await contexto()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { data: atual, error: erroAtual } = await ctx.supabase
        .from('produtos')
        .select('id, categoria_id, ordem')
        .eq('id', id)
        .eq('loja_id', ctx.lojaId)
        .maybeSingle()
    if (erroAtual) return { ok: false, erro: FALHA_AO_SALVAR }
    if (!atual) return { ok: false, erro: NAO_ENCONTRADO }

    const categoria = await categoriaDaLoja(ctx.supabase, ctx.lojaId, lido.dados.categoria_id)
    if (categoria.falhou) return { ok: false, erro: FALHA_AO_SALVAR }
    if (!categoria.existe) return { ok: false, erros: { categoria_id: 'Essa categoria não existe mais. Escolha outra.' } }

    let ordem = atual.ordem
    if (atual.categoria_id !== lido.dados.categoria_id) {
        const { data: irmaos, error: erroIrmaos } = await ctx.supabase
            .from('produtos')
            .select('ordem')
            .eq('loja_id', ctx.lojaId)
            .eq('categoria_id', lido.dados.categoria_id)
        if (erroIrmaos) return { ok: false, erro: FALHA_AO_SALVAR }
        ordem = irmaos.reduce((maior, p) => Math.max(maior, p.ordem), 0) + 1
    }

    const { data, error } = await ctx.supabase
        .from('produtos')
        .update({
            categoria_id: lido.dados.categoria_id,
            nome: lido.dados.nome,
            descricao: lido.dados.descricao,
            preco_centavos: lido.dados.preco,
            ordem,
        })
        .eq('id', id)
        .eq('loja_id', ctx.lojaId)
        .select('id')

    if (error) return { ok: false, erro: FALHA_AO_SALVAR }
    if (data.length === 0) return { ok: false, erro: NAO_ENCONTRADO }

    revalidatePath('/painel/cardapio')
    return { ok: true, id, lojaId: ctx.lojaId }
}

const FOTO_MAX_BYTES = 1_500_000
const TIPOS_DE_FOTO = ['image/webp', 'image/jpeg', 'image/png']

// Recebe a foto já reduzida pelo navegador (800px, WebP) e a sobe para fotos/{loja_id}/, trocando a atual
// e apagando a antiga. Sem arquivo, só remove a foto do produto. O envio passa pela Server Action para o
// navegador não precisar do cliente do Supabase.
export async function definirFotoDoProduto(id: string, formData: FormData): Promise<ResultadoSimples> {
    if (!z.uuid().safeParse(id).success) return { ok: false, erro: NAO_ENCONTRADO }

    const ctx = await contexto()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const arquivo = formData.get('foto')
    let url: string | null = null

    if (arquivo instanceof File && arquivo.size > 0) {
        if (!TIPOS_DE_FOTO.includes(arquivo.type)) return { ok: false, erro: 'Use uma imagem JPG, PNG ou WebP.' }
        if (arquivo.size > FOTO_MAX_BYTES) return { ok: false, erro: 'Essa foto é grande demais. Tente outra.' }

        const extensao = arquivo.type === 'image/webp' ? 'webp' : arquivo.type === 'image/png' ? 'png' : 'jpg'
        const nomeDoArquivo = `produto-${id}-${Date.now()}.${extensao}`
        const { error: erroEnvio } = await ctx.supabase.storage
            .from('fotos')
            .upload(`${ctx.lojaId}/${nomeDoArquivo}`, arquivo, { contentType: arquivo.type })
        if (erroEnvio) return { ok: false, erro: 'Não foi possível enviar a foto. Tente de novo.' }
        url = urlPublicaDaFoto(ctx.lojaId, nomeDoArquivo)
    }

    const { data: atual, error: erroAtual } = await ctx.supabase
        .from('produtos')
        .select('foto_url')
        .eq('id', id)
        .eq('loja_id', ctx.lojaId)
        .maybeSingle()
    if (erroAtual || !atual) {
        await apagarFotos(ctx.supabase, ctx.lojaId, [url])
        return { ok: false, erro: erroAtual ? 'Não foi possível salvar a foto. Tente de novo.' : NAO_ENCONTRADO }
    }

    const { data, error } = await ctx.supabase
        .from('produtos')
        .update({ foto_url: url })
        .eq('id', id)
        .eq('loja_id', ctx.lojaId)
        .select('id')
    if (error || data.length === 0) {
        // o arquivo já subiu e a gravação falhou: não deixa o arquivo novo solto
        await apagarFotos(ctx.supabase, ctx.lojaId, [url])
        return { ok: false, erro: error ? 'Não foi possível salvar a foto. Tente de novo.' : NAO_ENCONTRADO }
    }

    if (atual.foto_url !== url) await apagarFotos(ctx.supabase, ctx.lojaId, [atual.foto_url])

    revalidatePath('/painel/cardapio')
    return { ok: true }
}

export async function alternarProduto(id: string, ativo: boolean): Promise<ResultadoSimples> {
    if (!z.uuid().safeParse(id).success) return { ok: false, erro: NAO_ENCONTRADO }

    const ctx = await contexto()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { data, error } = await ctx.supabase
        .from('produtos')
        .update({ ativo })
        .eq('id', id)
        .eq('loja_id', ctx.lojaId)
        .select('id')

    if (error) return { ok: false, erro: 'Não foi possível mudar o produto. Tente de novo.' }
    if (data.length === 0) return { ok: false, erro: NAO_ENCONTRADO }

    revalidatePath('/painel/cardapio')
    return { ok: true }
}

export async function excluirProduto(id: string): Promise<ResultadoSimples> {
    if (!z.uuid().safeParse(id).success) return { ok: false, erro: NAO_ENCONTRADO }

    const ctx = await contexto()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { data: atual, error: erroAtual } = await ctx.supabase
        .from('produtos')
        .select('foto_url')
        .eq('id', id)
        .eq('loja_id', ctx.lojaId)
        .maybeSingle()
    if (erroAtual) return { ok: false, erro: 'Não foi possível excluir o produto. Tente de novo.' }
    if (!atual) return { ok: false, erro: NAO_ENCONTRADO }

    const { data, error } = await ctx.supabase
        .from('produtos')
        .delete()
        .eq('id', id)
        .eq('loja_id', ctx.lojaId)
        .select('id')
    if (error) return { ok: false, erro: 'Não foi possível excluir o produto. Tente de novo.' }
    if (data.length === 0) return { ok: false, erro: NAO_ENCONTRADO }

    await apagarFotos(ctx.supabase, ctx.lojaId, [atual.foto_url])

    revalidatePath('/painel/cardapio')
    return { ok: true }
}
