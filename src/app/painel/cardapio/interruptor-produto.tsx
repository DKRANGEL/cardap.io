'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { alternarProduto } from './actions-produto'

type Props = {
    id: string
    nome: string
    ativo: boolean
}

// Interruptor de 44px. Muda na hora e volta atrás, com aviso, se o servidor não confirmar.
export function InterruptorProduto({ id, nome, ativo }: Props) {
    const router = useRouter()
    const [, startTransition] = useTransition()
    const [valor, setValor] = useState(ativo)
    const [erro, setErro] = useState<string | null>(null)

    const alternar = () => {
        const proximo = !valor
        setValor(proximo)
        setErro(null)

        startTransition(async () => {
            try {
                const resultado = await alternarProduto(id, proximo)
                if (!resultado.ok) {
                    setValor(!proximo)
                    setErro(resultado.erro)
                    return
                }
                router.refresh()
            } catch {
                setValor(!proximo)
                setErro('Sem conexão. Tente de novo.')
            }
        })
    }

    return (
        <div className="flex shrink-0 flex-col items-end">
            <button
                type="button"
                role="switch"
                aria-checked={valor}
                aria-label={`${valor ? 'Desativar' : 'Ativar'} ${nome}`}
                onClick={alternar}
                className="flex h-11 w-14 items-center justify-center"
            >
                <span aria-hidden className={`flex h-7 w-12 items-center rounded-full p-0.5 transition-colors motion-reduce:transition-none ${
                    valor ? 'bg-sucesso' : 'bg-carvao-300'
                }`}>
                    <span className={`h-6 w-6 rounded-full bg-white shadow-sutil transition-transform motion-reduce:transition-none ${
                        valor ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                </span>
            </button>
            {erro && <p role="alert" className="max-w-[9rem] text-right text-xs leading-4 text-perigo">{erro}</p>}
        </div>
    )
}
