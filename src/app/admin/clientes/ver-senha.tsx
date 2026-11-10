'use client'

import { useState, useTransition } from 'react'
import { AlertCircleIcon, CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { verSenha } from './actions'

type Props = {
    id: string
    email: string
}

export function VerSenha({ id, email }: Props) {
    const [pendente, startTransition] = useTransition()
    const [senha, setSenha] = useState<string | null>(null)
    const [semRegistro, setSemRegistro] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [copiada, setCopiada] = useState(false)

    const ocultar = () => {
        setSenha(null)
        setSemRegistro(false)
        setErro(null)
        setCopiada(false)
    }

    const revelar = () => {
        setErro(null)
        startTransition(async () => {
            try {
                const r = await verSenha(id)
                if (!r.ok) return setErro(r.erro)
                if (r.senha === null) return setSemRegistro(true)
                setSenha(r.senha)
            } catch {
                setErro('Não deu pra consultar. Confira a conexão e tente de novo.')
            }
        })
    }

    const copiar = async () => {
        if (senha === null) return
        try {
            await navigator.clipboard.writeText(senha)
            setCopiada(true)
            setTimeout(() => setCopiada(false), 2000)
        } catch {
            setErro('Não foi possível copiar. Selecione a senha e copie manualmente.')
        }
    }

    const aberto = senha !== null || semRegistro

    return (
        <div className="flex flex-col gap-2">
            <button type="button" onClick={aberto ? ocultar : revelar} disabled={pendente}
                    aria-label={`${aberto ? 'Ocultar' : 'Ver'} a senha de ${email}`}
                    className="flex h-11 items-center gap-2 self-start rounded-full bg-superficie-marcada px-4 text-[15px] font-semibold text-tinta disabled:opacity-60">
                {aberto ? <EyeOffIcon aria-hidden className="h-4 w-4" /> : <EyeIcon aria-hidden className="h-4 w-4" />}
                {pendente ? 'Consultando…' : aberto ? 'Ocultar senha' : 'Ver senha'}
            </button>

            {senha !== null && (
                <div className="flex items-center gap-2 rounded-md bg-superficie-marcada p-2 pl-3">
                    <code className="min-w-0 flex-1 text-base break-all select-all">{senha}</code>
                    <button type="button" onClick={copiar} aria-label="Copiar a senha"
                            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold text-tinta">
                        {copiada ? <CheckIcon aria-hidden className="h-4 w-4" /> : <CopyIcon aria-hidden className="h-4 w-4" />}
                        {copiada ? 'Copiada' : 'Copiar'}
                    </button>
                </div>
            )}

            {semRegistro && (
                <p role="status" className="text-sm leading-5 text-tinta-media">
                    Senha não registrada. Use “Redefinir senha” para definir uma nova e poder consultá-la.
                </p>
            )}

            {erro && (
                <p role="alert" className="flex items-start gap-1.5 text-sm leading-5 text-perigo">
                    <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    {erro}
                </p>
            )}
        </div>
    )
}
