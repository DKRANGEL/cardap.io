import Link from 'next/link'
import { redirect } from 'next/navigation'
import { PlusIcon, UsersIcon } from 'lucide-react'
import { BOTAO_ESTADO, Estado } from '@/components/estado'
import { contextoDoAdmin, eAdmin } from '@/lib/acao-admin'
import { RedefinirSenha } from './redefinir-senha'
import { VerSenha } from './ver-senha'

export const metadata = { title: 'Clientes — cardap.io' }

const data = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' })

export default async function ClientesPage() {
    const ctx = await contextoDoAdmin()
    if (ctx.erro !== undefined) redirect('/painel')

    const { data: lista, error } = await ctx.admin.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (error) throw error

    const clientes = lista.users
        .filter((u) => !eAdmin(u.app_metadata))
        .sort((a, b) => b.created_at.localeCompare(a.created_at))

    const { data: lojas, error: erroLojas } = await ctx.admin
        .from('lojas')
        .select('owner_id, nome, slug')
        .in('owner_id', clientes.map((c) => c.id))
    if (erroLojas) throw erroLojas
    const lojaDe = new Map(lojas.map((l) => [l.owner_id as string, l]))

    return (
        <main className="mx-auto flex w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6 md:max-w-5xl md:px-8 md:pt-8">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">Clientes</h1>
                <p className="text-[15px] leading-[22px] text-tinta-media">
                    {clientes.length === 0
                        ? 'Cadastre o acesso do primeiro cliente.'
                        : `${clientes.length} ${clientes.length === 1 ? 'cliente' : 'clientes'}.`}
                </p>
            </header>

            <Link href="/admin/clientes/novo"
                  className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-acao text-base font-semibold text-acao-contraste md:self-start md:px-8">
                <PlusIcon aria-hidden className="h-5 w-5" />
                Cadastrar cliente
            </Link>

            {clientes.length === 0 ? (
                <Estado Icone={UsersIcon} titulo="Nenhum cliente ainda"
                        texto="Crie o e-mail e a senha de um cliente. Ele entra e monta o cardápio da própria loja.">
                    <Link href="/admin/clientes/novo" className={BOTAO_ESTADO}>Cadastrar cliente</Link>
                </Estado>
            ) : (
                <ul className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
                    {clientes.map((cliente) => {
                        const loja = lojaDe.get(cliente.id)
                        return (
                            <li key={cliente.id} className="flex flex-col gap-3 rounded-lg border border-borda p-4">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-[15px] leading-5 font-semibold break-all">{cliente.email}</p>
                                    <p className="text-sm leading-5 text-tinta-media">
                                        Criado em {data.format(new Date(cliente.created_at))}
                                    </p>
                                    <p className="text-sm leading-5 text-tinta-media">
                                        {loja ? `Loja: ${loja.nome} (/${loja.slug})` : 'Ainda não criou a loja.'}
                                    </p>
                                </div>
                                <VerSenha id={cliente.id} email={cliente.email ?? 'cliente'} />
                                <RedefinirSenha id={cliente.id} email={cliente.email ?? 'cliente'} />
                            </li>
                        )
                    })}
                </ul>
            )}
        </main>
    )
}
