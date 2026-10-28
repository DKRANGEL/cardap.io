'use client'

import { useState, useTransition, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircleIcon } from 'lucide-react'
import { Campo } from '@/components/campo'
import { criarCategoria, renomearCategoria } from './actions'

type Props = {
    categoria?: { id: string; nome: string }
    limite: number
}

export function FormularioCategoria({ categoria, limite }: Props) {
    const router = useRouter()
    const [pendente, startTransition] = useTransition()
    const [erroNome, setErroNome] = useState<string | null>(null)
    const [erroGeral, setErroGeral] = useState<string | null>(null)

    const aoEnviar = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setErroNome(null)
        setErroGeral(null)

        startTransition(async () => {
            try {
                const resultado = categoria
                    ? await renomearCategoria(categoria.id, formData)
                    : await criarCategoria(formData)

                if (!resultado.ok) {
                    setErroNome(resultado.erros?.nome ?? null)
                    setErroGeral(resultado.erro ?? null)
                    return
                }
                router.push('/painel/cardapio')
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
                id="nome"
                name="nome"
                rotulo="Nome da categoria"
                placeholder="Ex.: Bebidas"
                defaultValue={categoria?.nome ?? ''}
                dica={`Até ${limite} caracteres. Aparece como atalho no topo do cardápio.`}
                erro={erroNome}
                autoComplete="off"
                autoFocus={!categoria}
                aria-required
            />

            <div className="flex flex-col gap-2">
                <button
                    type="submit"
                    disabled={pendente}
                    className="flex h-[52px] w-full items-center justify-center rounded-full bg-acao text-base font-semibold text-acao-contraste disabled:opacity-60"
                >
                    {pendente ? 'Salvando…' : categoria ? 'Salvar' : 'Criar categoria'}
                </button>
                <Link href="/painel/cardapio"
                      className="flex h-12 w-full items-center justify-center rounded-full text-base font-semibold text-tinta">
                    Cancelar
                </Link>
            </div>
        </form>
    )
}
