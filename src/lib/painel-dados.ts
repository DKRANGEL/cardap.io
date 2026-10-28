import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type LojaDoPainel = {
    id: string
    slug: string
    nome: string
    whatsapp: string
    divulgado_em: string | null
}

export async function carregarPainel() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/entrar')

    const { data: loja, error } = await supabase
        .from('lojas')
        .select('id, slug, nome, whatsapp, divulgado_em')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle<LojaDoPainel>()

    if (error) throw error
    if (!loja) return { supabase, user, loja: null, totalCategorias: 0, totalProdutos: 0 }

    const [categorias, produtos] = await Promise.all([
        supabase.from('categorias').select('id', { count: 'exact', head: true }).eq('loja_id', loja.id),
        supabase.from('produtos').select('id', { count: 'exact', head: true }).eq('loja_id', loja.id),
    ])

    if (categorias.error) throw categorias.error
    if (produtos.error) throw produtos.error

    return {
        supabase,
        user,
        loja,
        totalCategorias: categorias.count ?? 0,
        totalProdutos: produtos.count ?? 0,
    }
}
