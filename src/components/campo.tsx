import { AlertCircleIcon } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> & {
    id: string
    rotulo: string
    erro?: string | null
    dica?: string
}

export function Campo({ id, rotulo, erro, dica, ...resto }: Props) {
    const idErro = `${id}-erro`
    const idDica = `${id}-dica`
    const descrito = [erro ? idErro : null, dica ? idDica : null].filter(Boolean).join(' ') || undefined

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-semibold text-tinta">{rotulo}</label>
            <input
                id={id}
                aria-invalid={erro ? true : undefined}
                aria-describedby={descrito}
                {...resto}
                className={`h-12 w-full rounded-md border bg-superficie px-4 text-base text-tinta placeholder:text-tinta-suave focus:border-tinta ${
                    erro ? 'border-perigo' : 'border-borda-forte'
                }`}
            />
            {dica && <p id={idDica} className="text-sm leading-5 text-tinta-media">{dica}</p>}
            {erro && (
                <p id={idErro} className="flex items-start gap-1.5 text-sm leading-5 text-perigo">
                    <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    {erro}
                </p>
            )}
        </div>
    )
}
