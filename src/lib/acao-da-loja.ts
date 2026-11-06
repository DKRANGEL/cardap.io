import { createClient } from '@/lib/supabase/server'

export const SESSAO_EXPIRADA = 'Sua sessão expirou. Entre novamente.'

export type ContextoDaLoja =
    | { erro: string }
    | { erro?: undefined; supabase: Awaited<ReturnType<typeof createClient>>; lojaId: string }

// Toda ação do painel começa igual: exige sessão e acha a loja do usuário. Além da RLS, as ações
// filtram por loja_id, para devolver uma mensagem clara em vez de "0 linhas" mudas.
export async function contextoDaLoja(textoSemLoja: string): Promise<ContextoDaLoja> {
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
    if (!loja) return { erro: textoSemLoja }
    return { supabase, lojaId: loja.id as string }
}
