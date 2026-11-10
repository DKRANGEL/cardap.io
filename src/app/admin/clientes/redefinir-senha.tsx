'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { AlertCircleIcon, CheckCircle2Icon, KeyRoundIcon } from 'lucide-react'
import { CampoSenha } from '@/components/campo-senha'
import { redefinirSenha } from './actions'

type Props = {
    id: string
    email: string
}

export function RedefinirSenha({ id, email }: Props) {
    const [aberto, setAberto] = useState(false)
    const [senha, setSenha] = useState('')
    const [pendente, startTransition] = useTransition()
    const [erroCampo, setErroCampo] = useState<string | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const [feito, setFeito] = useState(false)

    const fechar = () => {
        setAberto(false)
        setSenha('')
        setErroCampo(null)
        setErro(null)
    }

    const salvar = (e: FormEvent) => {
        e.preventDefault()
        setErroCampo(null)
        setErro(null)

        startTransition(async () => {
            try {
                const resultado = await redefinirSenha(id, senha)
                if (!resultado.ok) {
                    setErroCampo(resultado.erros?.senha ?? null)
                    setErro(resultado.erro ?? null)
                    return
                }
                fechar()
                setFeito(true)
            } catch {
                setErro('Não deu pra salvar. Confira a conexão e tente de novo.')
            }
        })
    }

    if (!aberto) {
        return (
            <div className="flex flex-col items-start gap-1">
                <button type="button" onClick={() => { setFeito(false); setAberto(true) }}
                        aria-label={`Redefinir a senha de ${email}`}
                        className="flex h-11 items-center gap-2 rounded-full bg-superficie-marcada px-4 text-[15px] font-semibold text-tinta">
                    <KeyRoundIcon aria-hidden className="h-4 w-4" />
                    Redefinir senha
                </button>
                {feito && (
                    <p role="status" className="flex items-start gap-1.5 text-sm leading-5 text-sucesso">
                        <CheckCircle2Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                        Senha alterada. Envie a nova senha ao cliente.
                    </p>
                )}
            </div>
        )
    }

    return (
        <form onSubmit={salvar} noValidate className="flex flex-col gap-3 rounded-md bg-superficie-marcada p-3">
            {erro && (
                <div role="alert" className="flex items-start gap-2 rounded-md bg-perigo-suave p-3 text-sm leading-5 text-perigo">
                    <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{erro}</p>
                </div>
            )}
            <CampoSenha
                id={`senha-${id}`}
                name="senha"
                rotulo="Nova senha"
                autoComplete="new-password"
                autoFocus
                aria-required
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErroCampo(null) }}
                erro={erroCampo}
            />
            <div className="flex gap-2">
                <button type="submit" disabled={pendente}
                        className="flex h-12 flex-1 items-center justify-center rounded-full bg-acao text-base font-semibold text-acao-contraste disabled:opacity-60">
                    {pendente ? 'Salvando…' : 'Salvar senha'}
                </button>
                <button type="button" onClick={fechar} disabled={pendente}
                        className="flex h-12 items-center justify-center rounded-full px-4 text-base font-semibold text-tinta disabled:opacity-60">
                    Cancelar
                </button>
            </div>
        </form>
    )
}
