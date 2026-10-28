'use client'

import { ErroDeRota } from '@/components/erro-de-rota'

export default function Erro(props: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErroDeRota {...props} titulo="Algo deu errado" texto="Não conseguimos abrir essa página. Tente de novo."
                       saida={{ href: '/', rotulo: 'Ir para o início' }} />
}
