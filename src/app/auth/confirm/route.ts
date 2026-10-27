import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            redirect('/painel')
        }
    }

    redirect('/entrar?erro=link_invalido')
}
