'use client'

import { useState, useTransition, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircleIcon } from 'lucide-react'
import { Campo } from '@/components/campo'
import { CampoSenha } from '@/components/campo-senha'
import { SENHA_MIN } from '@/lib/credenciais'
import { criarCliente, type CamposCliente } from '../actions'

export function FormularioCliente() {
    const router = useRouter()
    const [pendente, startTransition] = useTransition()
    const [erros, setErros] = useState<Partial<Record<CamposCliente, string>>>({})
    const [erroGeral, setErroGeral] = useState<string | null>(null)

    const limpar = (campo: CamposCliente) => setErros((e) => (e[campo] ? { ...e, [campo]: undefined } : e))

    const aoEnviar = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setErros({})
        setErroGeral(null)

        startTransition(async () => {
            try {
                const resultado = await criarCliente(formData)
                if (!resultado.ok) {
                    setErros(resultado.erros ?? {})
                    setErroGeral(resultado.erro ?? null)
                    return
                }
                router.push('/admin/clientes')
                router.refresh()
            } catch {
                setErroGeral('Não deu pra salvar. Confira a conexão e tente de novo.')
            }
        })
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={aoEnviar} noValidate>
            {erroGeral && (
                <div role="alert" className="flex items-start gap-2 rounded-md bg-perigo-suave p-3 text-sm leading-5 text-perigo">
                    <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{erroGeral}</p>
                </div>
            )}

            <Campo
                id="email"
                name="email"
                type="email"
                rotulo="E-mail do cliente"
                placeholder="cliente@exemplo.com"
                autoComplete="off"
                inputMode="email"
                autoCapitalize="none"
                autoFocus
                aria-required
                erro={erros.email}
                onChange={() => limpar('email')}
            />

            <CampoSenha
                id="senha"
                name="senha"
                rotulo="Senha de acesso"
                autoComplete="new-password"
                dica={`Mínimo de ${SENHA_MIN} caracteres. Envie essa senha ao cliente; ele pode trocá-la depois.`}
                aria-required
                erro={erros.senha}
                onChange={() => limpar('senha')}
            />

            <div className="flex flex-col gap-2">
                <button type="submit" disabled={pendente}
                        className="flex h-[52px] w-full items-center justify-center rounded-full bg-acao text-base font-semibold text-acao-contraste disabled:opacity-60">
                    {pendente ? 'Salvando…' : 'Cadastrar cliente'}
                </button>
                <Link href="/admin/clientes"
                      className="flex h-12 w-full items-center justify-center rounded-full text-base font-semibold text-tinta">
                    Cancelar
                </Link>
            </div>
        </form>
    )
}
