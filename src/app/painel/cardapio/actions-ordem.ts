'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { contextoDaLoja } from '@/lib/acao-da-loja'
import { ordemSchema } from '@/lib/validacao/ordem'

export type ResultadoOrdem = { ok: true } | { ok: false; erro: string }

const FALHA = 'Não foi possível salvar a nova ordem. A lista voltou como estava.'
const DESATUALIZADA = 'A lista mudou em outro lugar. Recarregamos para você tentar de novo.'

const contexto = () => contextoDaLoja('Crie sua loja antes de reordenar o cardápio.')

export async function reordenarCategorias(ids: string[]): Promise<ResultadoOrdem> {
    const lidos = ordemSchema.safeParse(ids)
    if (!lidos.success) return { ok: false, erro: FALHA }

    const ctx = await contexto()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { data, error } = await ctx.supabase.rpc('reordenar_categorias', { p_loja: ctx.lojaId, p_ids: lidos.data })
    if (error) return { ok: false, erro: FALHA }
    revalidatePath('/painel/cardapio')
    if (data !== lidos.data.length) return { ok: false, erro: DESATUALIZADA }
    return { ok: true }
}

export async function reordenarProdutos(categoriaId: string, ids: string[]): Promise<ResultadoOrdem> {
    const lidos = ordemSchema.safeParse(ids)
    if (!lidos.success || !z.uuid().safeParse(categoriaId).success) return { ok: false, erro: FALHA }

    const ctx = await contexto()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { data, error } = await ctx.supabase.rpc('reordenar_produtos', {
        p_loja: ctx.lojaId,
        p_categoria: categoriaId,
        p_ids: lidos.data,
    })
    if (error) return { ok: false, erro: FALHA }
    revalidatePath('/painel/cardapio')
    if (data !== lidos.data.length) return { ok: false, erro: DESATUALIZADA }
    return { ok: true }
}
