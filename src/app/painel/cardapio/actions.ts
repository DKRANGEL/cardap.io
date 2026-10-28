'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { categoriaSchema, nomeJaExiste, type CategoriaCampos } from '@/lib/validacao/categoria'

export type ResultadoCategoria =
    | { ok: true; id: string }
    | { ok: false; erro?: string; erros?: Partial<Record<CategoriaCampos, string>> }

export type ResultadoExclusao = { ok: true; produtosAfetados: number } | { ok: false; erro: string }

const SESSAO_EXPIRADA = 'Sua sessão expirou. Entre novamente.'
const NAO_ENCONTRADA = 'Essa categoria não existe mais. Volte à lista e confira.'

type Contexto =
    | { erro: string }
    | { erro?: undefined; supabase: Awaited<ReturnType<typeof createClient>>; lojaId: string }

async function contexto(): Promise<Contexto> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { erro: SESSAO_EXPIRADA }

    const { data: loja, error } = await supabase
        .from('lojas')
        .select('id')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

    if (error) return { erro: 'Não deu pra falar com o servidor. Tente de novo.' }
    if (!loja) return { erro: 'Crie sua loja antes de cadastrar categorias.' }
    return { supabase, lojaId: loja.id as string }
}

function lerNome(formData: FormData) {
    const parsed = categoriaSchema.safeParse({ nome: formData.get('nome') })
    if (parsed.success) return { nome: parsed.data.nome }

    const { fieldErrors } = z.flattenError(parsed.error)
    return { erros: { nome: fieldErrors.nome?.[0] ?? 'Informe o nome da categoria.' } }
}

const NOME_REPETIDO = 'Você já tem uma categoria com esse nome. Escolha outro.'

export async function criarCategoria(formData: FormData): Promise<ResultadoCategoria> {
    const lido = lerNome(formData)
    if ('erros' in lido) return { ok: false, erros: lido.erros }

    const ctx = await contexto()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { data: existentes, error: erroLista } = await ctx.supabase
        .from('categorias')
        .select('nome, ordem')
        .eq('loja_id', ctx.lojaId)
    if (erroLista) return { ok: false, erro: 'Não foi possível salvar a categoria. Tente de novo.' }

    if (nomeJaExiste(lido.nome, existentes.map((c) => c.nome))) {
        return { ok: false, erros: { nome: NOME_REPETIDO } }
    }

    const proximaOrdem = existentes.reduce((maior, c) => Math.max(maior, c.ordem), 0) + 1
    const { data, error } = await ctx.supabase
        .from('categorias')
        .insert({ loja_id: ctx.lojaId, nome: lido.nome, ordem: proximaOrdem })
        .select('id')
        .single()

    if (error) return { ok: false, erro: 'Não foi possível salvar a categoria. Tente de novo.' }

    revalidatePath('/painel/cardapio')
    return { ok: true, id: data.id }
}

export async function renomearCategoria(id: string, formData: FormData): Promise<ResultadoCategoria> {
    if (!z.uuid().safeParse(id).success) return { ok: false, erro: NAO_ENCONTRADA }

    const lido = lerNome(formData)
    if ('erros' in lido) return { ok: false, erros: lido.erros }

    const ctx = await contexto()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { data: existentes, error: erroLista } = await ctx.supabase
        .from('categorias')
        .select('id, nome')
        .eq('loja_id', ctx.lojaId)
    if (erroLista) return { ok: false, erro: 'Não foi possível salvar a categoria. Tente de novo.' }

    const atual = existentes.find((c) => c.id === id)
    if (!atual) return { ok: false, erro: NAO_ENCONTRADA }

    const outros = existentes.filter((c) => c.id !== id).map((c) => c.nome)
    if (nomeJaExiste(lido.nome, outros)) return { ok: false, erros: { nome: NOME_REPETIDO } }

    const { data, error } = await ctx.supabase
        .from('categorias')
        .update({ nome: lido.nome })
        .eq('id', id)
        .eq('loja_id', ctx.lojaId)
        .select('id')

    if (error) return { ok: false, erro: 'Não foi possível salvar a categoria. Tente de novo.' }
    if (data.length === 0) return { ok: false, erro: NAO_ENCONTRADA }

    revalidatePath('/painel/cardapio')
    return { ok: true, id }
}

export async function excluirCategoria(id: string): Promise<ResultadoExclusao> {
    if (!z.uuid().safeParse(id).success) return { ok: false, erro: NAO_ENCONTRADA }

    const ctx = await contexto()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { count, error: erroConta } = await ctx.supabase
        .from('produtos')
        .select('id', { count: 'exact', head: true })
        .eq('categoria_id', id)
        .eq('loja_id', ctx.lojaId)
    if (erroConta) return { ok: false, erro: 'Não foi possível excluir a categoria. Tente de novo.' }

    const { data, error } = await ctx.supabase
        .from('categorias')
        .delete()
        .eq('id', id)
        .eq('loja_id', ctx.lojaId)
        .select('id')

    if (error) return { ok: false, erro: 'Não foi possível excluir a categoria. Tente de novo.' }
    if (data.length === 0) return { ok: false, erro: NAO_ENCONTRADA }

    revalidatePath('/painel/cardapio')
    return { ok: true, produtosAfetados: count ?? 0 }
}
