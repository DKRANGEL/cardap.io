'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@heroui/react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    const sair = async () => {
        await supabase.auth.signOut()
        router.push('/painel/login')
        router.refresh()
    }

    return (
        <Button variant="flat" onPress={sair}>
            Sair
        </Button>
    )
}
