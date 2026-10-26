import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout-button'

export default async function PainelPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-4 p-6 text-center bg-background text-foreground">
            <h1 className="text-lg font-bold">Painel do lojista</h1>
            <p className="text-sm text-default-500">Logado como {user?.email}</p>
            <LogoutButton />
        </div>
    )
}
