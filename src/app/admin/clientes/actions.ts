'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { contextoDoAdmin, eAdmin } from '@/lib/acao-admin'
import { erroDaSenha, erroDoEmail, normalizarEmail } from '@/lib/credenciais'
import { mensagemDeCadastroDeCliente, mensagemDeSenhaNova } from '@/lib/erros-auth'

export type CamposCliente = 'email' | 'senha'

export type ResultadoCliente =
    | { ok: true }
    | { ok: false; erro?: string; erros?: Partial<Record<CamposCliente, string>> }

const texto = (valor: FormDataEntryValue | null) => (typeof valor === 'string' ? valor : '')

export async function criarCliente(formData: FormData): Promise<ResultadoCliente> {
    const email = texto(formData.get('email'))
    const senha = texto(formData.get('senha'))

    const erros = { email: erroDoEmail(email) ?? undefined, senha: erroDaSenha(senha) ?? undefined }
    if (erros.email || erros.senha) return { ok: false, erros }

    const ctx = await contextoDoAdmin()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { error } = await ctx.admin.auth.admin.createUser({
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

    revalidatePath('/admin/clientes')
    return { ok: true }
}

export async function redefinirSenha(id: string, senha: string): Promise<ResultadoCliente> {
    if (!z.uuid().safeParse(id).success) return { ok: false, erro: 'Esse cliente não existe mais.' }
    const problema = erroDaSenha(senha)
    if (problema) return { ok: false, erros: { senha: problema } }

    const ctx = await contextoDoAdmin()
    if (ctx.erro !== undefined) return { ok: false, erro: ctx.erro }

    const { data, error: erroBusca } = await ctx.admin.auth.admin.getUserById(id)
    if (erroBusca || !data.user) return { ok: false, erro: 'Esse cliente não existe mais.' }
    if (eAdmin(data.user.app_metadata)) return { ok: false, erro: 'Essa conta é de administrador e não pode ser alterada aqui.' }

    const { error } = await ctx.admin.auth.admin.updateUserById(id, { password: senha })
    if (error) return { ok: false, erro: mensagemDeSenhaNova(error) }

    return { ok: true }
}
