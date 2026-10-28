'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TriangleAlertIcon, WifiOffIcon } from 'lucide-react'
import { BOTAO_ESTADO, BOTAO_ESTADO_SECUNDARIO, Estado } from './estado'

type Props = {
    error: Error & { digest?: string }
    reset: () => void
    titulo: string
    texto: string
    saida?: { href: string; rotulo: string }
}

export function ErroDeRota({ error, reset, titulo, texto, saida }: Props) {
    const router = useRouter()
    const [tentando, startTransition] = useTransition()
    const [semInternet, setSemInternet] = useState(false)

    useEffect(() => {
        console.error(error)
        setSemInternet(!navigator.onLine)
    }, [error])

    // reset() sozinho só re-renderiza no cliente; para erro de Server Component é preciso buscar de novo.
    const tentarDeNovo = () =>
        startTransition(() => {
            router.refresh()
            reset()
        })

    return (
        <Estado tela Icone={semInternet ? WifiOffIcon : TriangleAlertIcon} titulo={titulo}
                texto={semInternet ? 'Parece que você está sem internet. Confira a conexão e tente de novo.' : texto}>
            <button type="button" onClick={tentarDeNovo} disabled={tentando}
                    className={`${BOTAO_ESTADO} disabled:opacity-60`}>
                {tentando ? 'Tentando…' : 'Tentar de novo'}
            </button>
            {saida && <Link href={saida.href} className={BOTAO_ESTADO_SECUNDARIO}>{saida.rotulo}</Link>}
        </Estado>
    )
}
