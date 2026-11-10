import type { CSSProperties, ReactNode } from 'react'
import { ProvidersHeroUI } from '@/components/providers-heroui'
import { createClient } from '@/lib/supabase/server'
import { temaDoPainel } from '@/lib/tema-do-painel'
import { BarraAbas } from './barra-abas'

// O painel usa a cor que o lojista escolheu para a loja, para ele ver o cardápio e o painel combinando.
async function corDaLoja() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('lojas')
        .select('cor_primaria')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
    const cor = data?.cor_primaria as string | null | undefined
    return cor && /^#[0-9a-f]{6}$/i.test(cor) ? cor : null
}

export default async function PainelLayout({ children }: { children: ReactNode }) {
    const cor = await corDaLoja()
    const tema = cor ? (temaDoPainel(cor) as CSSProperties) : undefined

    return (
        <ProvidersHeroUI>
            <div style={tema}>
                <div className="pb-[calc(56px+env(safe-area-inset-bottom))]">{children}</div>
                <BarraAbas />
            </div>
        </ProvidersHeroUI>
    )
}
