'use client'

import { useState, type FormEvent } from 'react'
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { Button, Input } from '@heroui/react'
import { Marca } from '@/components/marca'
import { erroDaSenha, erroDoEmail, normalizarEmail } from '@/lib/credenciais'
import { mensagemDoLogin } from '@/lib/erros-auth'
import { createClient } from '@/lib/supabase/client'

const ESTILO_CAMPO = { label: 'text-sm font-semibold !text-tinta', input: 'text-base placeholder:text-carvao-400' }

function MensagemDoCampo({ texto }: { texto: string }) {
    return (
        <span className="flex items-start gap-1.5 text-sm leading-5 text-perigo">
            <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {texto}
        </span>
    )
}

export function FormularioAcesso() {
    const [supabase] = useState(() => createClient())
    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [mostrar, setMostrar] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [erros, setErros] = useState<{ email?: string; senha?: string }>({})
    const [aviso, setAviso] = useState<string | null>(null)

    const entrar = async (e: FormEvent) => {
        e.preventDefault()
        setAviso(null)

        const novosErros = { email: erroDoEmail(email) ?? undefined, senha: senha ? undefined : 'Digite a senha.' }
        setErros(novosErros)
        if (novosErros.email || novosErros.senha) return

        setEnviando(true)
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email: normalizarEmail(email), password: senha })
            if (error) {
                setAviso(mensagemDoLogin(error))
                setEnviando(false)
                return
            }
            window.location.assign(data.user.app_metadata?.role === 'admin' ? '/admin' : '/painel')
        } catch {
            setAviso(mensagemDoLogin(null))
            setEnviando(false)
        }
    }

    return (
        <form className="flex flex-col gap-6" onSubmit={entrar} noValidate>
            <Marca />
            <div className="flex flex-col gap-2">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">Entrar no seu painel</h1>
                <p className="text-[15px] leading-[22px] text-tinta-media">
                    Use o e-mail e a senha que a equipe do cardap.io enviou pra você.
                </p>
            </div>

            {aviso && (
                <div role="alert" className="flex items-start gap-2 rounded-md bg-perigo-suave p-3 text-sm leading-5 text-perigo">
                    <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{aviso}</p>
                </div>
            )}

            <Input
                type="email"
                name="email"
                label="Seu e-mail"
                labelPlacement="outside"
                placeholder="nome@exemplo.com"
                value={email}
                onValueChange={(valor) => {
                    setEmail(valor)
                    if (erros.email) setErros((o) => ({ ...o, email: undefined }))
                }}
                autoComplete="username"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                isRequired
                validationBehavior="aria"
                size="lg"
                variant="bordered"
                classNames={ESTILO_CAMPO}
                isInvalid={Boolean(erros.email)}
                errorMessage={erros.email && <MensagemDoCampo texto={erros.email} />}
            />

            <Input
                type={mostrar ? 'text' : 'password'}
                name="senha"
                label="Senha"
                labelPlacement="outside"
                placeholder="Sua senha"
                value={senha}
                onValueChange={(valor) => {
                    setSenha(valor)
                    if (erros.senha) setErros((o) => ({ ...o, senha: undefined }))
                }}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                isRequired
                validationBehavior="aria"
                size="lg"
                variant="bordered"
                classNames={ESTILO_CAMPO}
                isInvalid={Boolean(erros.senha)}
                errorMessage={erros.senha && <MensagemDoCampo texto={erros.senha} />}
                endContent={
                    <button
                        type="button"
                        onClick={() => setMostrar((v) => !v)}
                        aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
                        aria-pressed={mostrar}
                        className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-tinta-media"
                    >
                        {mostrar ? <EyeOffIcon aria-hidden className="h-5 w-5" /> : <EyeIcon aria-hidden className="h-5 w-5" />}
                    </button>
                }
            />

            <div className="flex flex-col gap-3">
                <Button type="submit" color="primary" isLoading={enviando} className="h-[52px] w-full text-base font-semibold">
                    Entrar
                </Button>
                <p className="text-sm leading-5 text-tinta-suave">
                    Ainda não recebeu seu acesso? Fale com a equipe do cardap.io.
                </p>
            </div>
        </form>
    )
}
