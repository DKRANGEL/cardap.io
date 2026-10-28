import Link from 'next/link'
import { MessageCircleIcon, QrCodeIcon, SmartphoneIcon } from 'lucide-react'
import { Marca } from '@/components/marca'

export const metadata = {
    title: 'cardap.io — cardápio digital pra sua lanchonete',
    description: 'Monte o cardápio da sua loja pelo celular, divulgue por link ou QR code e receba os pedidos no WhatsApp.',
}

const PASSOS = [
    { Icone: SmartphoneIcon, titulo: 'Monte pelo celular', texto: 'Cadastre produtos, preços e fotos em poucos minutos, sem instalar nada.' },
    { Icone: QrCodeIcon, titulo: 'Divulgue por link ou QR code', texto: 'Seus clientes abrem o cardápio direto no celular, sem baixar app.' },
    { Icone: MessageCircleIcon, titulo: 'Receba no WhatsApp', texto: 'O pedido chega pronto na conversa da loja, com itens e total.' },
]

const LINK_PRIMARIO =
    'flex h-[52px] w-full items-center justify-center rounded-full bg-acao text-base font-semibold text-acao-contraste'
const LINK_SECUNDARIO =
    'flex h-[52px] w-full items-center justify-center rounded-full bg-superficie-marcada text-base font-semibold text-tinta'

export default function PaginaInicial() {
    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col gap-8 px-6 py-10">
            <Marca />

            <header className="flex flex-col gap-3">
                <h1 className="text-[28px] leading-[30px] font-extrabold tracking-tight">
                    O cardápio da sua loja, no celular do cliente
                </h1>
                <p className="text-[15px] leading-[22px] text-tinta-media">
                    Para lanchonetes, hamburguerias e pizzarias. Você monta o cardápio, divulga o link e recebe os pedidos
                    no WhatsApp.
                </p>
            </header>

            <div className="flex flex-col gap-3">
                <Link href="/entrar" className={LINK_PRIMARIO}>Entrar no meu painel</Link>
                <Link href="/burger-do-joca-demo" className={LINK_SECUNDARIO}>Ver um cardápio de exemplo</Link>
            </div>

            <ol aria-label="Como funciona" className="flex flex-col gap-3">
                {PASSOS.map(({ Icone, titulo, texto }) => (
                    <li key={titulo} className="flex gap-3 rounded-lg border border-borda p-4">
                        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-acao-suave">
                            <Icone className="h-5 w-5 text-acao" />
                        </span>
                        <div>
                            <h2 className="text-[17px] leading-[22px] font-bold">{titulo}</h2>
                            <p className="mt-0.5 text-sm leading-5 text-tinta-media">{texto}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </main>
    )
}
