import Link from 'next/link'
import { StoreIcon } from 'lucide-react'
import { BOTAO_ESTADO, Estado } from '@/components/estado'
import { carregarPainel } from '@/lib/painel-dados'
import { NOME_CATEGORIA_MAX } from '@/lib/validacao/categoria'
import { FormularioCategoria } from '../../formulario-categoria'

export const metadata = { title: 'Nova categoria — cardap.io' }

export default async function NovaCategoriaPage() {
    const { loja } = await carregarPainel()

    return (
        <main className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
            <h1 className="text-xl leading-[26px] font-bold tracking-tight">Nova categoria</h1>

            {loja ? (
                <FormularioCategoria limite={NOME_CATEGORIA_MAX} />
            ) : (
                <Estado Icone={StoreIcon} titulo="Crie sua loja primeiro"
                        texto="As categorias ficam dentro da sua loja. Comece pelos dados dela.">
                    <Link href="/painel/loja" className={BOTAO_ESTADO}>Criar minha loja</Link>
                </Estado>
            )}
        </main>
    )
}
