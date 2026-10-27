'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOutIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
    const router = useRouter()
    const [supabase] = useState(() => createClient())
    const [saindo, setSaindo] = useState(false)

    const sair = async () => {
        setSaindo(true)
        await supabase.auth.signOut()
        router.push('/entrar')
        router.refresh()
    }

    return (
        <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-superficie-marcada text-base font-semibold text-tinta disabled:opacity-60"
        >
            <LogOutIcon aria-hidden className="h-5 w-5" />
            {saindo ? 'Saindo…' : 'Sair da conta'}
        </button>
    )
}
