import Image from 'next/image'
import { ImageOffIcon } from 'lucide-react'

type Props = {
    src: string | null
    nome: string
    tamanho: number
    raio: string
}

export function FotoProduto({ src, nome, tamanho, raio }: Props) {
    const estilo = { width: tamanho, height: tamanho }

    if (!src) {
        return (
            <div aria-hidden style={estilo}
                 className={`flex shrink-0 items-center justify-center bg-superficie-marcada ${raio}`}>
                <ImageOffIcon className="h-6 w-6 text-carvao-400" />
            </div>
        )
    }

    return (
        <Image
            src={src}
            alt={nome}
            width={tamanho}
            height={tamanho}
            unoptimized={src.startsWith('http')}
            style={estilo}
            className={`shrink-0 object-cover ${raio}`}
        />
    )
}
