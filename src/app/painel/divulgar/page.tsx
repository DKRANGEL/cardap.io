import { headers } from 'next/headers'
import Link from 'next/link'
import QRCode from 'qrcode'
import { StoreIcon } from 'lucide-react'
import { carregarPainel } from '@/lib/painel-dados'
import { BotaoCopiar } from './botao-copiar'

export const metadata = { title: 'Divulgar — cardap.io' }

async function enderecoDoSite() {
    const h = await headers()
    const host = h.get('x-forwarded-host') ?? h.get('host')
    const protocolo = h.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https')
    return `${protocolo}://${host}`
}

export default async function DivulgarPage() {
    const { supabase, loja } = await carregarPainel()

    if (!loja) {
        return (
            <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">Divulgar</h1>
                <section className="flex flex-col items-center gap-3 rounded-lg border border-borda p-6 text-center">
                    <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-full bg-superficie-marcada">
                        <StoreIcon className="h-6 w-6 text-tinta-media" />
                    </span>
                    <h2 className="text-[17px] leading-[22px] font-bold">Crie sua loja primeiro</h2>
                    <p className="text-[15px] leading-[22px] text-tinta-media">
                        O link e o QR code só existem depois que a loja tem um endereço.
                    </p>
                    <Link href="/painel/loja"
                          className="flex h-[52px] w-full items-center justify-center rounded-full bg-acao text-base font-semibold text-acao-contraste">
                        Criar minha loja
                    </Link>
                </section>
            </main>
        )
    }

    if (!loja.divulgado_em) {
        await supabase.from('lojas').update({ divulgado_em: new Date().toISOString() }).eq('id', loja.id)
    }

    const link = `${await enderecoDoSite()}/${loja.slug}`
    const qr = await QRCode.toString(link, {
        type: 'svg',
        width: 240,
        margin: 2,
        color: { dark: '#1c1814', light: '#ffffff' },
    })

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">Divulgar</h1>
                <p className="text-[15px] leading-[22px] text-tinta-media">
                    Mande o link pros seus clientes ou mostre o QR code no balcão.
                </p>
            </header>

            <section aria-labelledby="titulo-link" className="flex flex-col gap-3">
                <h2 id="titulo-link" className="text-[17px] leading-[22px] font-bold">Link do cardápio</h2>
                <p className="rounded-md border border-borda bg-superficie-sutil p-3 text-[15px] leading-[22px] break-all">
                    {link}
                </p>
                <BotaoCopiar texto={link} />
            </section>

            <section aria-labelledby="titulo-qr" className="flex flex-col items-center gap-3">
                <h2 id="titulo-qr" className="self-start text-[17px] leading-[22px] font-bold">QR code</h2>
                <div role="img" aria-label={`QR code do cardápio ${loja.nome}`}
                     className="rounded-lg border border-borda bg-white p-2"
                     dangerouslySetInnerHTML={{ __html: qr }} />
                <p className="text-sm leading-5 text-tinta-media">Aponte a câmera do celular pra abrir o cardápio.</p>
            </section>
        </main>
    )
}
