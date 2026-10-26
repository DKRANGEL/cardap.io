import { createClient } from '@/lib/supabase/server'
import { BotaoLink } from '@/components/botao-link'
import { LogoutButton } from './logout-button'

export default async function PainelPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: loja } = await supabase
        .from('lojas')
        .select('slug, nome')
        .eq('owner_id', user!.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

    return (
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 p-6 bg-background text-foreground">
            <div className="flex flex-col gap-1">
                <h1 className="text-lg font-bold">Painel do lojista</h1>
                <p className="text-sm text-default-500">Logado como {user?.email}</p>
            </div>

            {loja ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-default-200 p-4">
                    <p className="font-semibold">{loja.nome}</p>
                    <BotaoLink href="/painel/loja" principal>Editar loja</BotaoLink>
                    <BotaoLink href={`/${loja.slug}`}>Ver cardápio</BotaoLink>
                    <BotaoLink href={`/${loja.slug}/qr`}>Ver QR code</BotaoLink>
                </div>
            ) : (
                <div className="flex flex-col gap-3 rounded-2xl border border-default-200 p-4">
                    <p className="text-sm text-default-500">Você ainda não criou sua loja.</p>
                    <BotaoLink href="/painel/loja" principal>Criar minha loja</BotaoLink>
                </div>
            )}

            <LogoutButton />
        </div>
    )
}
