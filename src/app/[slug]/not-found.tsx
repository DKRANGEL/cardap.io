import { StoreIcon } from 'lucide-react'
import { Estado } from '@/components/estado'

export const metadata = { title: 'Cardápio não encontrado — cardap.io' }

export default function CardapioNaoEncontrado() {
    return (
        <Estado tela Icone={StoreIcon} titulo="Esse cardápio não existe"
                texto="O link pode ter mudado. Peça o link novo pra loja." />
    )
}
