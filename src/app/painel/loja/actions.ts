'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { lojaSchema, type LojaCampos } from '@/lib/validacao/loja'

export type ResultadoSalvarLoja =
    | { ok: true; lojaId: string; slug: string }
    | { ok: false; erro?: string; erros?: Partial<Record<LojaCampos, string>> }

export async function salvarLoja(formData: FormData): Promise<ResultadoSalvarLoja> {
    const parsed = lojaSchema.safeParse({
        nome: formData.get('nome'),
        slug: formData.get('slug'),
        whatsapp: formData.get('whatsapp'),
        cor_primaria: formData.get('cor_primaria'),
    })

    if (!parsed.success) {
        const { fieldErrors } = z.flattenError(parsed.error)
        const erros: Partial<Record<LojaCampos, string>> = {}
        for (const [campo, mensagens] of Object.entries(fieldErrors)) {
            if (mensagens?.[0]) erros[campo as LojaCampos] = mensagens[0]
        }
        return { ok: false, erros }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, erro: 'Sua sessão expirou. Entre novamente.' }

    const { data: existente } = await supabase
        .from('lojas')
        .select('id')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

    const query = existente
        ? supabase.from('lojas').update(parsed.data).eq('id', existente.id)
        : supabase.from('lojas').insert({ ...parsed.data, owner_id: user.id })

    const { data, error } = await query.select('id, slug').single()

    if (error) {
        if (error.code === '23505') {
            return { ok: false, erros: { slug: 'Esse endereço já está em uso. Escolha outro.' } }
        }
        return { ok: false, erro: 'Não foi possível salvar a loja. Tente de novo.' }
    }

    return { ok: true, lojaId: data.id, slug: data.slug }
}

export async function salvarLogo(lojaId: string, logoUrl: string): Promise<{ ok: boolean; erro?: string }> {
    const prefixo = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/fotos/${lojaId}/`
    const valido = z.uuid().safeParse(lojaId).success && logoUrl.startsWith(prefixo)
    if (!valido) return { ok: false, erro: 'Endereço de imagem inválido.' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, erro: 'Sua sessão expirou. Entre novamente.' }

    const { error } = await supabase
        .from('lojas')
        .update({ logo_url: logoUrl })
        .eq('id', lojaId)
        .eq('owner_id', user.id)

    if (error) return { ok: false, erro: 'Não foi possível salvar o logo.' }
    return { ok: true }
}
