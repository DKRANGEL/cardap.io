import Link from 'next/link'
import { LayoutListIcon } from 'lucide-react'
import { carregarPainel } from '@/lib/painel-dados'

export const metadata = { title: 'Cardápio — cardap.io' }

export default async function CardapioPainelPage() {
    const { loja, totalCategorias, totalProdutos } = await carregarPainel()

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
            <h1 className="text-xl leading-[26px] font-bold tracking-tight">Cardápio</h1>

            {!loja ? (
                <section className="flex flex-col items-center gap-3 rounded-lg border border-borda p-6 text-center">
                    <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-superficie-marcada">
                        <LayoutListIcon className="h-6 w-6 text-tinta-media" />
                    </span>
                    <h2 className="text-[17px] leading-[22px] font-bold">Crie sua loja primeiro</h2>
                    <p className="text-[15px] leading-[22px] text-tinta-media">
                        Os produtos ficam dentro da sua loja. Comece pelos dados dela.
                    </p>
                    <Link href="/painel/loja"
                          className="flex h-[52px] w-full items-center justify-center rounded-full bg-acao text-base font-semibold text-acao-contraste">
                        Criar minha loja
                    </Link>
                </section>
            ) : (
                <section className="flex flex-col items-center gap-3 rounded-lg border border-borda p-6 text-center">
                    <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-superficie-marcada">
                        <LayoutListIcon className="h-6 w-6 text-tinta-media" />
                    </span>
                    <h2 className="text-[17px] leading-[22px] font-bold">Em breve: categorias e produtos</h2>
                    <p className="text-[15px] leading-[22px] text-tinta-media">
                        Aqui você vai cadastrar e organizar o que vende. Essa parte ainda está sendo construída.
                    </p>
                    <p className="text-sm leading-5 tabular-nums text-tinta-suave">
                        Hoje: {totalCategorias} {totalCategorias === 1 ? 'categoria' : 'categorias'} e {totalProdutos}{' '}
                        {totalProdutos === 1 ? 'produto' : 'produtos'}.
                    </p>
                </section>
            )}
        </main>
    )
}
