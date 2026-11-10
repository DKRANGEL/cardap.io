'use client'

import { useState, type ComponentProps } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { Campo } from './campo'

type Props = Omit<ComponentProps<typeof Campo>, 'type'>

export function CampoSenha(props: Props) {
    const [mostrar, setMostrar] = useState(false)

    return (
        <div className="flex flex-col gap-1">
            <Campo {...props} type={mostrar ? 'text' : 'password'} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
            <button
                type="button"
                onClick={() => setMostrar((v) => !v)}
                aria-pressed={mostrar}
                className="flex h-11 items-center gap-2 self-start rounded-full pr-3 text-[15px] font-semibold text-tinta-media"
            >
                {mostrar ? <EyeOffIcon aria-hidden className="h-5 w-5" /> : <EyeIcon aria-hidden className="h-5 w-5" />}
                {mostrar ? 'Ocultar senha' : 'Mostrar senha'}
            </button>
        </div>
    )
}
