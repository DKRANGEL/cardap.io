'use client'

import { ErroDeRota } from '@/components/erro-de-rota'

export default function ErroDoCardapio(props: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErroDeRota {...props} titulo="Não deu pra carregar o cardápio"
                       texto="Pode ser a sua conexão. Tente de novo." />
}
