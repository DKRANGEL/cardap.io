'use client'

import { useEffect } from 'react'
import Link from 'next/link'
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
    useEffect(() => {
        console.error(error)
    }, [error])

    const deRede = /fetch failed|network|failed to fetch/i.test(error.message)

    return (
        <Estado tela Icone={deRede ? WifiOffIcon : TriangleAlertIcon} titulo={titulo}
                texto={deRede ? 'Parece um problema de conexão. Confira a internet e tente de novo.' : texto}>
            <button type="button" onClick={reset} className={BOTAO_ESTADO}>Tentar de novo</button>
            {saida && <Link href={saida.href} className={BOTAO_ESTADO_SECUNDARIO}>{saida.rotulo}</Link>}
        </Estado>
    )
}
