import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { whatsappParaExibicao } from '@/lib/validacao/loja'
import { LogoutButton } from '../logout-button'
import { LojaForm } from './loja-form'

export default async function LojaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/entrar')

    const { data: loja } = await supabase
        .from('lojas')
        .select('id, slug, nome, whatsapp, cor_primaria, logo_url')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">
                    {loja ? 'Sua loja' : 'Criar sua loja'}
                </h1>
                <p className="text-[15px] leading-[22px] text-tinta-media">
                    {loja
                        ? 'Essas informações aparecem no seu cardápio.'
                        : 'Preencha os dados abaixo pra publicar seu cardápio.'}
                </p>
            </header>

            <LojaForm
                loja={loja}
                whatsappInicial={loja ? whatsappParaExibicao(loja.whatsapp) : ''}
            />

            <section aria-labelledby="titulo-conta" className="mt-4 flex flex-col gap-3 border-t border-borda pt-6">
                <h2 id="titulo-conta" className="text-[17px] leading-[22px] font-bold">Sua conta</h2>
                <p className="text-sm leading-5 break-all text-tinta-media">Você entrou como {user.email}.</p>
                <LogoutButton />
            </section>
        </main>
    )
}
