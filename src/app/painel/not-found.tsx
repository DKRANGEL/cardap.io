import Link from 'next/link'
import { CompassIcon } from 'lucide-react'
import { BOTAO_ESTADO, Estado } from '@/components/estado'

export const metadata = { title: 'Não encontramos isso — cardap.io' }

export default function NaoEncontradoNoPainel() {
    return (
        <Estado tela Icone={CompassIcon} titulo="Não encontramos isso"
                texto="O que você procurava não existe mais ou o endereço está errado.">
            <Link href="/painel/cardapio" className={BOTAO_ESTADO}>Voltar ao cardápio</Link>
        </Estado>
    )
}
