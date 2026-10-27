import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { whatsappParaExibicao } from '@/lib/validacao/loja'
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
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 p-6 bg-background text-foreground">
            <div className="flex flex-col gap-1">
                <h1 className="text-lg font-bold">{loja ? 'Editar loja' : 'Criar sua loja'}</h1>
                <p className="text-sm text-default-500">
                    {loja
                        ? 'Essas informações aparecem no seu cardápio.'
                        : 'Preencha os dados abaixo pra publicar seu cardápio.'}
                </p>
            </div>

            <LojaForm
                key={loja?.id ?? 'nova'}
                loja={loja}
                whatsappInicial={loja ? whatsappParaExibicao(loja.whatsapp) : ''}
            />
        </div>
    )
}
