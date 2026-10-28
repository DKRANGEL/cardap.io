import Link from 'next/link'
import { CompassIcon } from 'lucide-react'
import { BOTAO_ESTADO, Estado } from '@/components/estado'

export const metadata = { title: 'Página não encontrada — cardap.io' }

export default function NaoEncontrada() {
    return (
        <Estado tela Icone={CompassIcon} titulo="Essa página não existe"
                texto="O endereço pode estar errado ou ter mudado.">
            <Link href="/" className={BOTAO_ESTADO}>Ir para o início</Link>
        </Estado>
    )
}
