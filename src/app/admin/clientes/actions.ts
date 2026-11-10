'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { contextoDoAdmin, eAdmin, type ContextoDoAdmin } from '@/lib/acao-admin'
import { cifrar, decifrar } from '@/lib/cifra-senha'
import { erroDaSenha, erroDoEmail, normalizarEmail } from '@/lib/credenciais'
import { mensagemDeCadastroDeCliente, mensagemDeSenhaNova } from '@/lib/erros-auth'

export type CamposCliente = 'email' | 'senha'

export type ResultadoCliente =
    | { ok: true }
    | { ok: false; erro?: string; erros?: Partial<Record<CamposCliente, string>> }

export type ResultadoSenha =
    | { ok: true; senha: string | null }
    | { ok: false; erro: string }

type Admin = Extract<ContextoDoAdmin, { admin: unknown }>['admin']

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor : '')
const NAO_EXISTE = 'Esse cliente não existe mais.'
const FALHA_AO_GUARDAR = 'Não foi possível guardar a senha. Tente de novo.'

async function guardarSenha(admin: Admin, userId: string, senha: string) {
    try {
        const { error } = await admin
            .from('cliente_senhas')
            .upsert({ user_id: userId, senha_cifrada: cifrar(senha), atualizada_em: new Date().toISOString() })
        return !error
    } catch {
        return false
    }
}

export async function criarCliente(formData: FormData): Promise<ResultadoCliente> {
    const email = texto(formData.get('email'))
    const senha = texto(formData.get('senha'))

    const erros = { email: erroDoEmail(email) ?? undefined, senha: erroDaSenha(senha) ?? undefined }
    if (erros.email || erros.senha) return { ok: false, erros }

    const ctx = await contextoDoAdmin()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { data, error } = await ctx.admin.auth.admin.createUser({
        email: normalizarEmail(email),
        password: senha,
        email_confirm: true,
    })
    if (error) {
        const mensagem = mensagemDeCadastroDeCliente(error)
        const campo: CamposCliente = error.code === 'weak_password' ? 'senha' : 'email'
        const porCampo = error.code === 'email_exists' || error.code === 'user_already_exists' || error.code === 'weak_password'
        return porCampo ? { ok: false, erros: { [campo]: mensagem } } : { ok: false, erro: mensagem }
    }

    // Sem a senha guardada o admin não conseguiria vê-la depois; desfaz o usuário para não ficar pela metade.
    if (!(await guardarSenha(ctx.admin, data.user.id, senha))) {
        await ctx.admin.auth.admin.deleteUser(data.user.id)
        return { ok: false, erro: FALHA_AO_GUARDAR }
    }

    revalidatePath('/admin/clientes')
    return { ok: true }
}

export async function redefinirSenha(id: string, senha: string): Promise<ResultadoCliente> {
    if (!z.guid().safeParse(id).success) return { ok: false, erro: NAO_EXISTE }
    const problema = erroDaSenha(senha)
    if (problema) return { ok: false, erros: { senha: problema } }

    const ctx = await contextoDoAdmin()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { data, error: erroBusca } = await ctx.admin.auth.admin.getUserById(id)
    if (erroBusca || !data.user) return { ok: false, erro: NAO_EXISTE }
    if (eAdmin(data.user.app_metadata)) return { ok: false, erro: 'Essa conta é de administrador e não pode ser alterada aqui.' }

    const { error } = await ctx.admin.auth.admin.updateUserById(id, { password: senha })
    if (error) return { ok: false, erro: mensagemDeSenhaNova(error) }

    if (!(await guardarSenha(ctx.admin, id, senha))) {
        await ctx.admin.from('cliente_senhas').delete().eq('user_id', id)
        return { ok: false, erro: 'A senha foi alterada, mas não pôde ser guardada para consulta. Redefina de novo.' }
    }

    revalidatePath('/admin/clientes')
    return { ok: true }
}

export async function verSenha(id: string): Promise<ResultadoSenha> {
    if (!z.guid().safeParse(id).success) return { ok: false, erro: NAO_EXISTE }

    const ctx = await contextoDoAdmin()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { data: alvo } = await ctx.admin.auth.admin.getUserById(id)
    if (!alvo.user || eAdmin(alvo.user.app_metadata)) return { ok: false, erro: NAO_EXISTE }

    const { data, error } = await ctx.admin.from('cliente_senhas').select('senha_cifrada').eq('user_id', id).maybeSingle()
    if (error) return { ok: false, erro: 'Não foi possível consultar a senha. Tente de novo.' }
    if (!data) return { ok: true, senha: null }

    try {
        return { ok: true, senha: decifrar(data.senha_cifrada as string) }
    } catch {
        return { ok: false, erro: 'Não foi possível ler a senha guardada (chave diferente?). Redefina a senha do cliente.' }
    }
}
