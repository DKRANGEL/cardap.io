import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import Link from 'next/link'
import QRCode from 'qrcode'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

type Props = {
    params: Promise<{ slug: string }>
}

async function getLoja(slug: string) {
    const supabase = await createClient()

    const { data: loja, error } = await supabase
        .from('lojas')
        .select('nome, slug')
        .eq('slug', slug)
        .eq('ativo', true)
        .maybeSingle()

    if (error) throw error
    return loja
}

async function getCardapioUrl(slug: string) {
    const headersList = await headers()
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https')
    return `${protocol}://${host}/${slug}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    let loja
    try {
        loja = await getLoja(slug)
    } catch {
        return {}
    }
    if (!loja) return { title: 'Cardápio não encontrado — cardap.io' }

    return { title: `QR code — ${loja.nome}` }
}

export default async function QrPage({ params }: Props) {
    const { slug } = await params
    const loja = await getLoja(slug)

    if (!loja) notFound()

    const url = await getCardapioUrl(slug)
    const qrSvg = await QRCode.toString(url, {
        type: 'svg',
        width: 260,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
    })

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center gap-6 p-6 text-center bg-background text-foreground">
            <div className="flex flex-col gap-1">
                <h1 className="text-lg font-bold">{loja.nome}</h1>
                <p className="text-sm text-default-500">Aponte a câmera pra abrir o cardápio</p>
            </div>

            <div
                className="rounded-2xl border border-default-200 bg-white p-4"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
            />

            <p className="max-w-xs break-words text-sm text-default-500">{url}</p>

            <Link href={`/${slug}`} className="text-sm font-medium text-primary underline underline-offset-4">
                Voltar ao cardápio
            </Link>
        </div>
    )
}
