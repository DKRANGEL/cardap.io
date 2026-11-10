import { FormularioCliente } from './formulario-cliente'

export const metadata = { title: 'Novo cliente — cardap.io' }

export default function NovoClientePage() {
    return (
        <main className="mx-auto flex w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6 md:max-w-xl md:px-8 md:pt-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">Novo cliente</h1>
                <p className="text-[15px] leading-[22px] text-tinta-media">
                    Crie o acesso do cliente. Ele entra em <strong className="text-tinta">/entrar</strong> com esse e-mail e
                    essa senha e cadastra a própria loja.
                </p>
            </header>
            <FormularioCliente />
        </main>
    )
}
