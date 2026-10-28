'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { AlertCircleIcon } from 'lucide-react'

type Props = {
    aberto: boolean
    onFechar: () => void
    titulo: string
    children: ReactNode
    rotuloConfirmar: string
    rotuloCancelar: string
    onConfirmar: () => void
    pendente?: boolean
    erro?: string | null
}

// <dialog> nativo: já prende o foco, fecha com Escape, deixa o fundo inerte e devolve o foco
// ao botão que o abriu. Sem JS de biblioteca, de propósito.
export function DialogoConfirmacao({
    aberto, onFechar, titulo, children, rotuloConfirmar, rotuloCancelar, onConfirmar, pendente = false, erro,
}: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (aberto && !dialog.open) {
            dialog.showModal()
            document.body.style.overflow = 'hidden'
        }
        if (!aberto && dialog.open) {
            dialog.close()
            document.body.style.overflow = ''
        }
    }, [aberto])

    useEffect(() => () => {
        document.body.style.overflow = ''
    }, [])

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="dialogo-titulo"
            onCancel={(e) => {
                e.preventDefault()
                if (!pendente) onFechar()
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !pendente) onFechar()
            }}
            className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-tinta backdrop:bg-[rgba(28,24,20,0.5)] open:flex open:flex-col open:justify-end"
        >
            <div className="mx-auto flex w-full max-w-[520px] flex-col gap-4 rounded-t-xl bg-superficie px-4 pt-6 pb-[calc(16px+env(safe-area-inset-bottom))] shadow-folha">
                <div className="flex flex-col gap-2">
                    <h2 id="dialogo-titulo" className="text-xl leading-[26px] font-bold tracking-tight">{titulo}</h2>
                    <div className="text-[15px] leading-[22px] text-tinta-media">{children}</div>
                </div>

                {erro && (
                    <div role="alert" className="flex items-start gap-2 rounded-md bg-perigo-suave p-3 text-sm leading-5 text-perigo">
                        <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{erro}</p>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <button type="button" onClick={onConfirmar} disabled={pendente}
                            className="flex h-[52px] w-full items-center justify-center rounded-full bg-perigo-suave text-base font-semibold text-perigo disabled:opacity-60">
                        {pendente ? 'Excluindo…' : rotuloConfirmar}
                    </button>
                    <button type="button" autoFocus onClick={onFechar} disabled={pendente}
                            className="flex h-12 w-full items-center justify-center rounded-full text-base font-semibold text-tinta disabled:opacity-60">
                        {rotuloCancelar}
                    </button>
                </div>
            </div>
        </dialog>
    )
}
