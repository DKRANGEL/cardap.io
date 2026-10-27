'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'

type Props = {
    texto: string
}

type Estado = 'parado' | 'copiado' | 'falhou'

// O navegador embutido do Instagram/WhatsApp costuma negar navigator.clipboard.
// Nesse caso, seleciona um campo escondido e usa o comando antigo, que ainda funciona lá.
function copiarPeloComandoAntigo(texto: string) {
    const campo = document.createElement('textarea')
    campo.value = texto
    campo.setAttribute('readonly', '')
    campo.style.position = 'fixed'
    campo.style.top = '0'
    campo.style.opacity = '0'
    document.body.appendChild(campo)
    campo.select()
    campo.setSelectionRange(0, texto.length)
    try {
        return document.execCommand('copy')
    } catch {
        return false
    } finally {
        document.body.removeChild(campo)
    }
}

async function copiar(texto: string) {
    try {
        await navigator.clipboard.writeText(texto)
        return true
    } catch {
        return copiarPeloComandoAntigo(texto)
    }
}

export function BotaoCopiar({ texto }: Props) {
    const [estado, setEstado] = useState<Estado>('parado')
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

    useEffect(() => () => clearTimeout(timer.current), [])

    const aoTocar = async () => {
        clearTimeout(timer.current)
        setEstado((await copiar(texto)) ? 'copiado' : 'falhou')
        timer.current = setTimeout(() => setEstado('parado'), 2500)
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                onClick={aoTocar}
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-acao text-base font-semibold text-acao-contraste"
            >
                {estado === 'copiado' ? (
                    <CheckIcon aria-hidden className="h-5 w-5" />
                ) : (
                    <CopyIcon aria-hidden className="h-5 w-5" />
                )}
                {estado === 'copiado' ? 'Link copiado' : 'Copiar link'}
            </button>
            <p role="status" className="min-h-5 text-sm leading-5 text-tinta-media">
                {estado === 'copiado' && 'Pronto, é só colar na conversa.'}
                {estado === 'falhou' && 'Não deu pra copiar. Segure o link acima e copie na mão.'}
            </p>
        </div>
    )
}
