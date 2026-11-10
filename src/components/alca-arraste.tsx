import type { PointerEventHandler } from 'react'
import { GripVerticalIcon } from 'lucide-react'

type Props = {
    nome: string
    arrastando: boolean
    onPointerDown: PointerEventHandler<HTMLButtonElement>
    onPointerMove: PointerEventHandler<HTMLButtonElement>
    onPointerUp: PointerEventHandler<HTMLButtonElement>
    onPointerCancel: PointerEventHandler<HTMLButtonElement>
}

// touch-action: none só aqui: no resto da linha o dedo continua rolando a página.
export function AlcaArraste({ nome, arrastando, ...eventos }: Props) {
    return (
        <button
            type="button"
            aria-label={`Arrastar para reordenar ${nome}`}
            {...eventos}
            style={{ touchAction: 'none' }}
            className={`flex h-11 w-11 shrink-0 cursor-grab items-center justify-center rounded-md text-tinta-suave ${
                arrastando ? 'cursor-grabbing bg-superficie-marcada text-tinta' : ''
            }`}
        >
            <GripVerticalIcon aria-hidden className="h-5 w-5" />
        </button>
    )
}
