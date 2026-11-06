'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2Icon } from 'lucide-react'
import { DialogoConfirmacao } from '@/components/dialogo-confirmacao'
import { alternarProduto, excluirProduto } from './actions-produto'

type Props = {
    id: string
    nome: string
    ativo: boolean
}

export function ExcluirProduto({ id, nome, ativo }: Props) {
    const router = useRouter()
    const botaoRef = useRef<HTMLButtonElement>(null)
    const [aberto, setAberto] = useState(false)
    const [pendente, startTransition] = useTransition()
    const [erro, setErro] = useState<string | null>(null)

    const confirmar = () => {
        setErro(null)
        startTransition(async () => {
            try {
                const resultado = await excluirProduto(id)
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

    const apenasDesativar = () => {
        setErro(null)
        startTransition(async () => {
            try {
                const resultado = await alternarProduto(id, false)
                if (!resultado.ok) {
                    setErro(resultado.erro)
                    return
                }
                router.push('/painel/cardapio')
                router.refresh()
            } catch {
                setErro('Não deu pra desativar. Confira a conexão e tente de novo.')
            }
        })
    }

    return (
        <>
            <button
                ref={botaoRef}
                type="button"
                onClick={() => {
                    setErro(null)
                    setAberto(true)
                }}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-perigo-suave text-base font-semibold text-perigo"
            >
                <Trash2Icon aria-hidden className="h-5 w-5" />
                Excluir produto
            </button>

            <DialogoConfirmacao
                aberto={aberto}
                onFechar={() => setAberto(false)}
                titulo={`Excluir “${nome}”?`}
                rotuloConfirmar="Excluir produto"
                rotuloCancelar="Manter produto"
                onConfirmar={confirmar}
                pendente={pendente}
                erro={erro}
                devolverFocoA={botaoRef}
                acaoAlternativa={ativo ? { rotulo: 'Só desativar (volta quando quiser)', onClick: apenasDesativar } : undefined}
            >
                <p>
                    Ele e a foto dele serão apagados e isso não pode ser desfeito.
                    {ativo && ' Se é só pra tirar do cardápio por um tempo, desative em vez de excluir.'}
                </p>
            </DialogoConfirmacao>
        </>
    )
}
