'use server'

import { cifrar } from '@/lib/cifra-senha'
import { eAdmin } from '@/lib/acao-admin'
import { erroDaSenha } from '@/lib/credenciais'
import { mensagemDeSenhaNova } from '@/lib/erros-auth'
import { SESSAO_EXPIRADA } from '@/lib/acao-da-loja'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ResultadoTrocaDeSenha = { ok: true } | { ok: false; erro: string }

// A troca passa pelo servidor para a senha guardada (que o admin consulta) não ficar desatualizada.
export async function trocarMinhaSenha(senha: string): Promise<ResultadoTrocaDeSenha> {
    const problema = erroDaSenha(senha)
    if (problema) return { ok: false, erro: problema }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, erro: SESSAO_EXPIRADA }

    const { error } = await supabase.auth.updateUser({ password: senha })
    if (error) return { ok: false, erro: mensagemDeSenhaNova(error) }

    if (!eAdmin(user.app_metadata)) {
        const admin = createAdminClient()
        let guardada = false
        try {
            const { error: erroGuardar } = await admin
                .from('cliente_senhas')
                .upsert({ user_id: user.id, senha_cifrada: cifrar(senha), atualizada_em: new Date().toISOString() })
            guardada = !erroGuardar
        } catch {
            guardada = false
        }
        if (!guardada) await admin.from('cliente_senhas').delete().eq('user_id', user.id)
    }

    return { ok: true }
}
