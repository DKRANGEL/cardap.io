'use client'

import { useState, type FormEvent } from 'react'
import { AlertCircleIcon, CheckCircle2Icon, KeyRoundIcon } from 'lucide-react'
import { CampoSenha } from '@/components/campo-senha'
import { SENHA_MIN, erroDaSenha } from '@/lib/credenciais'
import { mensagemDeSenhaNova } from '@/lib/erros-auth'
import { createClient } from '@/lib/supabase/client'

export function TrocarSenha() {
    const [supabase] = useState(() => createClient())
    const [aberto, setAberto] = useState(false)
    const [senha, setSenha] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [erroCampo, setErroCampo] = useState<string | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const [feito, setFeito] = useState(false)

    const fechar = () => {
        setAberto(false)
        setSenha('')
        setErroCampo(null)
        setErro(null)
    }

    const salvar = async (e: FormEvent) => {
        e.preventDefault()
        setErro(null)

        const problema = erroDaSenha(senha)
        setErroCampo(problema)
        if (problema) return

        setEnviando(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: senha })
            if (error) {
                setErro(mensagemDeSenhaNova(error))
                return
            }
            fechar()
            setFeito(true)
        } catch {
            setErro('Não deu pra falar com o servidor. Confira a conexão e tente de novo.')
        } finally {
            setEnviando(false)
        }
    }

    if (!aberto) {
        return (
            <div className="flex flex-col gap-2">
                <button type="button" onClick={() => { setFeito(false); setAberto(true) }}
                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-superficie-marcada text-base font-semibold text-tinta">
                    <KeyRoundIcon aria-hidden className="h-5 w-5" />
                    Trocar senha
                </button>
                {feito && (
                    <p role="status" className="flex items-start gap-1.5 text-sm leading-5 text-sucesso">
                        <CheckCircle2Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                        Senha alterada. Use a nova senha no próximo acesso.
                    </p>
                )}
            </div>
        )
    }

    return (
        <form onSubmit={salvar} noValidate className="flex flex-col gap-3">
            {erro && (
                <div role="alert" className="flex items-start gap-2 rounded-md bg-perigo-suave p-3 text-sm leading-5 text-perigo">
                    <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{erro}</p>
                </div>
            )}
            <CampoSenha
                id="nova-senha"
                name="nova-senha"
                rotulo="Nova senha"
                autoComplete="new-password"
                dica={`Mínimo de ${SENHA_MIN} caracteres.`}
                autoFocus
                aria-required
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErroCampo(null) }}
                erro={erroCampo}
            />
            <div className="flex gap-2">
                <button type="submit" disabled={enviando}
                        className="flex h-[52px] flex-1 items-center justify-center rounded-full bg-acao text-base font-semibold text-acao-contraste disabled:opacity-60">
                    {enviando ? 'Salvando…' : 'Salvar senha'}
                </button>
                <button type="button" onClick={fechar} disabled={enviando}
                        className="flex h-[52px] items-center justify-center rounded-full px-4 text-base font-semibold text-tinta disabled:opacity-60">
                    Cancelar
                </button>
            </div>
        </form>
    )
}
