'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Button, Image } from '@heroui/react'
import { ImagePlusIcon } from 'lucide-react'
import { redimensionarImagem } from '@/lib/imagem'

type Props = {
    logoAtualUrl: string | null
    nome: string
    onChange: (blob: Blob | null) => void
}

export function LogoUpload({ logoAtualUrl, nome, onChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(logoAtualUrl)
    const [erro, setErro] = useState<string | null>(null)
    const [processando, setProcessando] = useState(false)
    const urlTemporaria = useRef<string | null>(null)

    useEffect(() => {
        return () => {
            if (urlTemporaria.current) URL.revokeObjectURL(urlTemporaria.current)
        }
    }, [])

    const aoEscolher = async (e: ChangeEvent<HTMLInputElement>) => {
        const arquivo = e.target.files?.[0]
        e.target.value = ''
        if (!arquivo) return

        setErro(null)
        setProcessando(true)
        try {
            const blob = await redimensionarImagem(arquivo)
            if (urlTemporaria.current) URL.revokeObjectURL(urlTemporaria.current)
            urlTemporaria.current = URL.createObjectURL(blob)
            setPreviewUrl(urlTemporaria.current)
            onChange(blob)
        } catch {
            setErro('Não foi possível usar essa imagem. Tente outra.')
        } finally {
            setProcessando(false)
        }
    }

    return (
        <div className="flex items-center gap-4">
            {previewUrl ? (
                <Image alt={`Logo de ${nome || 'loja'}`} src={previewUrl} width={80} height={80} radius="lg"
                       className="h-20 w-20 object-cover" />
            ) : (
                <div aria-hidden className="flex h-20 w-20 items-center justify-center rounded-large bg-default-100">
                    <ImagePlusIcon className="h-6 w-6 text-default-400" />
                </div>
            )}
            <div className="flex flex-col gap-1">
                <Button variant="flat" className="min-h-11" isLoading={processando}
                        onPress={() => inputRef.current?.click()}>
                    {previewUrl ? 'Trocar logo' : 'Escolher logo'}
                </Button>
                {erro && <p className="text-sm text-danger">{erro}</p>}
            </div>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={aoEscolher} />
        </div>
    )
}
