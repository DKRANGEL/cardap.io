import type { Metadata } from 'next'
import { FormularioAcesso } from './formulario-acesso'

export const metadata: Metadata = {
    title: 'Entrar no seu painel — cardap.io',
}

type Props = {
    searchParams: Promise<{ erro?: string }>
}

export default async function EntrarPage({ searchParams }: Props) {
    const { erro } = await searchParams

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col justify-center px-6 py-10">
            <FormularioAcesso linkInvalido={erro === 'link_invalido'} />
        </main>
    )
}
