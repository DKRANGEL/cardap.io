import { createClient } from '@supabase/supabase-js'

// Chave de serviço: ignora a RLS. Só pode ser importada por código de servidor da área /admin,
// sempre depois de contextoDoAdmin() confirmar que quem chama é admin.
export function createAdminClient() {
    const chave = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!chave) throw new Error('SUPABASE_SERVICE_ROLE_KEY não está definida.')

    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, chave, {
        auth: { persistSession: false, autoRefreshToken: false },
    })
}
