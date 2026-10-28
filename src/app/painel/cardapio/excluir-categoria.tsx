'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2Icon } from 'lucide-react'
import { DialogoConfirmacao } from '@/components/dialogo-confirmacao'
import { excluirCategoria } from './actions'

type Props = {
    id: string
    nome: string
    produtos: number
}

export function ExcluirCategoria({ id, nome, produtos }: Props) {
    const router = useRouter()
    const botaoRef = useRef<HTMLButtonElement>(null)
    const [aberto, setAberto] = useState(false)
    const [pendente, startTransition] = useTransition()
    const [erro, setErro] = useState<string | null>(null)

    const abrir = () => {
        setErro(null)
        setAberto(true)
    }

    const confirmar = () => {
        setErro(null)
        startTransition(async () => {
            try {
                const resultado = await excluirCategoria(id)
                if (!resultado.ok) {
                    setErro(resultado.erro)
                    return
                }
                router.push('/painel/cardapio')
                router.refresh()
            } catch {
                setErro('Não deu pra excluir. Confira a conexão e tente de novo.')
            }
        })
    }

    return (
        <>
            <button
                ref={botaoRef}
                type="button"
                onClick={abrir}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-perigo-suave text-base font-semibold text-perigo"
            >
                <Trash2Icon aria-hidden className="h-5 w-5" />
                Excluir categoria
            </button>

            <DialogoConfirmacao
                aberto={aberto}
                onFechar={() => setAberto(false)}
                titulo={`Excluir “${nome}”?`}
                rotuloConfirmar="Excluir categoria"
                rotuloCancelar="Manter categoria"
                onConfirmar={confirmar}
                pendente={pendente}
                erro={erro}
                devolverFocoA={botaoRef}
            >
                {produtos > 0 ? (
                    <p>
                        {produtos === 1 ? 'O produto dela não será apagado' : `Os ${produtos} produtos dela não serão apagados`}:
                        {' '}ficam sem categoria e aparecem em “Outros” no seu cardápio.
                    </p>
                ) : (
                    <p>Ela não tem produtos. Essa ação não pode ser desfeita.</p>
                )}
            </DialogoConfirmacao>
        </>
    )
}
