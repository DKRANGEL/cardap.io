import Link from 'next/link'
import { CheckIcon, ChevronRightIcon, ExternalLinkIcon } from 'lucide-react'
import { carregarPainel } from '@/lib/painel-dados'
import { calcularRegua, type Passo } from '@/lib/regua-publicacao'

export const metadata = { title: 'Início — cardap.io' }

function MarcaDoPasso({ numero, pronto }: { numero: number; pronto: boolean }) {
    if (pronto) {
        return (
            <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sucesso text-carvao-0">
                <CheckIcon className="h-[18px] w-[18px]" strokeWidth={3} />
            </span>
        )
    }
    return (
        <span aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-borda-forte text-sm font-bold text-tinta-media">
            {numero}
        </span>
    )
}

function LinhaDoPasso({ passo, numero, atual }: { passo: Passo; numero: number; atual: boolean }) {
    const corpo = (
        <>
            <MarcaDoPasso numero={numero} pronto={passo.pronto} />
            <span className="min-w-0 flex-1">
                <span className="block text-[17px] leading-[22px] font-bold">
                    {passo.titulo}
                    {passo.pronto && <span className="sr-only"> (feito)</span>}
                </span>
                <span className="mt-0.5 block text-sm leading-5 text-tinta-media">{passo.detalhe}</span>
            </span>
            {!passo.pronto && <ChevronRightIcon aria-hidden className="h-5 w-5 shrink-0 text-tinta-suave" />}
        </>
    )

    const base = 'flex min-h-[64px] items-center gap-3 rounded-lg border p-3'

    if (passo.pronto) {
        return <li className={`${base} border-borda bg-superficie-sutil`}>{corpo}</li>
    }

    return (
        <li>
            <Link
                href={passo.href}
                aria-current={atual ? 'step' : undefined}
                className={`${base} ${atual ? 'border-acao bg-acao-suave' : 'border-borda bg-superficie'}`}
            >
                {corpo}
            </Link>
        </li>
    )
}

export default async function PainelPage() {
    const { user, loja, totalCategorias, totalProdutos } = await carregarPainel()
    const regua = calcularRegua({ loja, totalCategorias, totalProdutos })

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
            {regua.completa && loja ? (
                <>
                    <header className="flex flex-col gap-1">
                        <h1 className="text-xl leading-[26px] font-bold tracking-tight">{loja.nome}</h1>
                        <p className="text-[15px] leading-[22px] text-tinta-media">Seu cardápio está no ar.</p>
                    </header>

                    <section aria-label="Situação da loja" className="flex flex-col gap-4 rounded-lg border border-borda p-4">
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm leading-5 text-tinta-media">Categorias</dt>
                                <dd className="text-[22px] leading-[26px] font-extrabold tabular-nums">{totalCategorias}</dd>
                            </div>
                            <div>
                                <dt className="text-sm leading-5 text-tinta-media">Produtos</dt>
                                <dd className="text-[22px] leading-[26px] font-extrabold tabular-nums">{totalProdutos}</dd>
                            </div>
                        </dl>
                        <p className="text-sm leading-5 break-all text-tinta-media">cardap.io/{loja.slug}</p>
                        <Link
                            href={`/${loja.slug}`}
                            className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-acao text-base font-semibold text-acao-contraste"
                        >
                            Ver meu cardápio
                            <ExternalLinkIcon aria-hidden className="h-5 w-5" />
                        </Link>
                    </section>
                </>
            ) : (
                <>
                    <header className="flex flex-col gap-1">
                        <h1 className="text-xl leading-[26px] font-bold tracking-tight">
                            {loja ? `Vamos publicar ${loja.nome}` : 'Vamos montar seu cardápio'}
                        </h1>
                        <p className="text-[15px] leading-[22px] text-tinta-media">
                            {regua.concluidos} de {regua.passos.length} passos feitos.
                        </p>
                    </header>

                    <ol aria-label="Passos pra publicar o cardápio" className="flex flex-col gap-3">
                        {regua.passos.map((passo, i) => (
                            <LinhaDoPasso key={passo.id} passo={passo} numero={i + 1} atual={passo.id === regua.atual} />
                        ))}
                    </ol>
                </>
            )}

            <p className="mt-auto text-sm leading-5 break-all text-tinta-suave">Você entrou como {user.email}.</p>
        </main>
    )
}
