import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
    Icone: LucideIcon
    titulo: string
    texto: string
    children?: ReactNode
    tela?: boolean
}

export function Estado({ Icone, titulo, texto, children, tela = false }: Props) {
    const conteudo = (
        <section className="mx-auto flex w-full max-w-[360px] flex-col items-center gap-3 px-4 py-10 text-center">
            <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-superficie-marcada">
                <Icone className="h-6 w-6 text-tinta-media" />
            </span>
            <h1 className="text-[17px] leading-[22px] font-bold">{titulo}</h1>
            <p className="text-[15px] leading-[22px] text-tinta-media">{texto}</p>
            {children && <div className="mt-2 flex w-full flex-col gap-2">{children}</div>}
        </section>
    )

    if (!tela) return conteudo
    return <main className="flex min-h-dvh flex-col justify-center bg-superficie text-tinta">{conteudo}</main>
}

export const BOTAO_ESTADO =
    'flex h-[52px] w-full items-center justify-center rounded-full bg-acao text-base font-semibold text-acao-contraste'
export const BOTAO_ESTADO_SECUNDARIO =
    'flex h-12 w-full items-center justify-center rounded-full text-base font-semibold text-tinta'
