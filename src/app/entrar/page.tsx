import type { Metadata } from 'next'
import { FormularioAcesso } from './formulario-acesso'

export const metadata: Metadata = {
    title: 'Entrar no seu painel — cardap.io',
}

export default function EntrarPage() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col justify-center px-6 py-10">
            <FormularioAcesso />
        </main>
    )
}
