'use client'

import { useState } from 'react'
import { toBRL } from '@/lib/moeda'
import { centavosDigitados } from '@/lib/validacao/produto'
import { Campo } from './campo'

type Props = {
    id: string
    name: string
    rotulo: string
    centavosIniciais?: number
    erro?: string | null
    dica?: string
    onMudar?: () => void
}

// Máscara em reais: a pessoa digita só números e eles entram pela direita (2 -> R$ 0,02; 2790 -> R$ 27,90).
// Apagar tira o último dígito. O campo sempre mostra reais; o que vai ao servidor é o texto mascarado,
// que a validação converte para centavos.
export function CampoPreco({ id, name, rotulo, centavosIniciais = 0, erro, dica, onMudar }: Props) {
    const [centavos, setCentavos] = useState(centavosIniciais)

    return (
        <Campo
            id={id}
            name={name}
            rotulo={rotulo}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="R$ 0,00"
            value={centavos === 0 ? '' : toBRL(centavos)}
            onChange={(e) => {
                setCentavos(centavosDigitados(e.target.value))
                onMudar?.()
            }}
            dica={dica}
            erro={erro}
            aria-required
        />
    )
}
