import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { SESSAO_EXPIRADA } from '@/lib/acao-da-loja'

export type ContextoDoAdmin =
    | { erro: string }
    | { erro?: undefined; admin: ReturnType<typeof createAdminClient>; usuarioId: string }

export const eAdmin = (appMetadata: Record<string, unknown> | undefined) => appMetadata?.role === 'admin'

// getUser() consulta o servidor de auth (não confia só no cookie), e app_metadata só é gravado
// pela chave de serviço, então o usuário não consegue se promover.
export async function contextoDoAdmin(): Promise<ContextoDoAdmin> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { erro: SESSAO_EXPIRADA }
    if (!eAdmin(user.app_metadata)) return { erro: 'Você não tem permissão para isso.' }
    return { admin: createAdminClient(), usuarioId: user.id }
}
