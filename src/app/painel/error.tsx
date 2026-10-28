'use client'

import { ErroDeRota } from '@/components/erro-de-rota'

export default function ErroDoPainel(props: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErroDeRota {...props} titulo="Não deu pra carregar o painel"
                       texto="Seus dados estão salvos. Tente de novo em instantes." />
}
