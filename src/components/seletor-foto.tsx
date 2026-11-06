'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { AlertCircleIcon, ImagePlusIcon } from 'lucide-react'
import { redimensionarImagem } from '@/lib/imagem'

type Props = {
    fotoAtualUrl: string | null
    nome: string
    ladoMax: number
    onChange: (blob: Blob | null) => void
    onRemover?: () => void
    removida?: boolean
}

const ACEITAS = /^image\//

// Galeria ou câmera (`accept="image/*"`), reduzida no próprio aparelho antes de ir ao servidor
// para gastar pouco dado. Não depende de HeroUI.
export function SeletorFoto({ fotoAtualUrl, nome, ladoMax, onChange, onRemover, removida = false }: Props) {
    const inputRef = useRef<HTMLInputElement>(null)
    const urlTemporaria = useRef<string | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(fotoAtualUrl)
    const [erro, setErro] = useState<string | null>(null)
    const [processando, setProcessando] = useState(false)

    useEffect(() => () => {
        if (urlTemporaria.current) URL.revokeObjectURL(urlTemporaria.current)
    }, [])

    const mostrando = removida ? null : previewUrl

    const aoEscolher = async (e: ChangeEvent<HTMLInputElement>) => {
        const arquivo = e.target.files?.[0]
        e.target.value = ''
        if (!arquivo) return

        setErro(null)
        if (!ACEITAS.test(arquivo.type)) {
            setErro('Esse arquivo não é uma imagem. Escolha uma foto.')
            return
        }

        setProcessando(true)
        try {
            const blob = await redimensionarImagem(arquivo, ladoMax)
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

    const remover = () => {
        if (urlTemporaria.current) {
            URL.revokeObjectURL(urlTemporaria.current)
            urlTemporaria.current = null
        }
        setPreviewUrl(null)
        setErro(null)
        onChange(null)
        onRemover?.()
    }

    return (
        <div className="flex flex-col gap-1.5">
            <span id="foto-rotulo" className="text-sm font-semibold text-tinta">Foto (opcional)</span>
            <div className="flex items-center gap-4">
                {mostrando ? (
                    // eslint-disable-next-line @next/next/no-img-element -- prévia local (blob:) não passa pelo otimizador
                    <img src={mostrando} alt={`Foto de ${nome || 'produto'}`} width={96} height={96}
                         className="h-24 w-24 shrink-0 rounded-lg border border-borda object-cover" />
                ) : (
                    <div aria-hidden className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-superficie-marcada">
                        <ImagePlusIcon className="h-7 w-7 text-carvao-500" />
                    </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <button type="button" aria-labelledby="foto-rotulo" onClick={() => inputRef.current?.click()}
                            disabled={processando}
                            className="flex h-12 w-full items-center justify-center rounded-full bg-superficie-marcada text-base font-semibold text-tinta disabled:opacity-60">
                        {processando ? 'Preparando…' : mostrando ? 'Trocar foto' : 'Escolher foto'}
                    </button>
                    {mostrando && (
                        <button type="button" onClick={remover}
                                className="flex h-11 w-full items-center justify-center rounded-full text-[15px] font-semibold text-perigo">
                            Remover foto
                        </button>
                    )}
                </div>
            </div>
            {erro && (
                <p role="alert" className="flex items-start gap-1.5 text-sm leading-5 text-perigo">
                    <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    {erro}
                </p>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" tabIndex={-1} aria-hidden onChange={aoEscolher} />
        </div>
    )
}
