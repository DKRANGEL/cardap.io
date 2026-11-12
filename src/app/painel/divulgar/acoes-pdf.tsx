'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircleIcon, EyeIcon, SendIcon, Share2Icon, XIcon } from 'lucide-react'

const URL_PDF = '/painel/divulgar/pdf'
const A4_LARGURA = 794
const A4_ALTURA = 1123

type Props = { slug: string }

export function AcoesPdf({ slug }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [previewAberto, setPreviewAberto] = useState(false)
    const [html, setHtml] = useState<string | null>(null)
    const [escala, setEscala] = useState(1)
    const [gerando, setGerando] = useState(false)
    const [pronto, setPronto] = useState<File | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const [carregandoPreview, setCarregandoPreview] = useState(false)
    const nomeArquivo = `cardapio-${slug}.pdf`

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (previewAberto && !dialog.open) {
            dialog.showModal()
            document.body.style.overflow = 'hidden'
        }
        if (!previewAberto && dialog.open) {
            dialog.close()
            document.body.style.overflow = ''
        }
    }, [previewAberto])

    useEffect(() => () => { document.body.style.overflow = '' }, [])

    useEffect(() => {
        if (!previewAberto) return
        const ajustar = () => setEscala(Math.min(1, (window.innerWidth - 24) / A4_LARGURA))
        ajustar()
        window.addEventListener('resize', ajustar)
        return () => window.removeEventListener('resize', ajustar)
    }, [previewAberto])

    const abrirPreview = async () => {
        setErro(null)
        setPreviewAberto(true)
        setCarregandoPreview(true)
        try {
            const res = await fetch(`${URL_PDF}?formato=html`)
            if (!res.ok) throw new Error()
            setHtml(await res.text())
        } catch {
            setPreviewAberto(false)
            setErro('Não foi possível carregar a prévia. Confira a conexão e tente de novo.')
        } finally {
            setCarregandoPreview(false)
        }
    }

    const baixar = (arquivo: File) => {
        const url = URL.createObjectURL(arquivo)
        const a = document.createElement('a')
        a.href = url
        a.download = arquivo.name
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 5000)
    }

    const entregar = async (arquivo: File) => {
        if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [arquivo] })) {
            try {
                await navigator.share({ files: [arquivo], title: arquivo.name })
                return
            } catch (e) {
                if (e instanceof DOMException && e.name === 'AbortError') return
                if (e instanceof DOMException && e.name === 'NotAllowedError') {
                    setPronto(arquivo)
                    setErro('O celular pediu um novo toque para compartilhar. Toque em “Enviar” abaixo.')
                    return
                }
            }
        }
        baixar(arquivo)
    }

    const gerar = async () => {
        setErro(null)
        setGerando(true)
        const controle = new AbortController()
        const limite = setTimeout(() => controle.abort(), 25_000)
        try {
            const res = await fetch(URL_PDF, { signal: controle.signal })
            if (!res.ok || !res.headers.get('content-type')?.includes('application/pdf')) throw new Error()
            const arquivo = new File([await res.blob()], nomeArquivo, { type: 'application/pdf' })
            setPronto(arquivo)
            await entregar(arquivo)
        } catch {
            setErro('Não foi possível gerar o PDF agora. Tente de novo em instantes.')
        } finally {
            clearTimeout(limite)
            setGerando(false)
        }
    }

    const botao = 'flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-base font-semibold disabled:opacity-60'

    return (
        <div className="flex flex-col gap-3">
            <button type="button" onClick={abrirPreview} className={`${botao} bg-superficie-marcada text-tinta`}>
                <EyeIcon aria-hidden className="h-5 w-5" />
                Ver cardápio
            </button>
            <button type="button" onClick={gerar} disabled={gerando} className={`${botao} bg-acao text-acao-contraste`}>
                <Share2Icon aria-hidden className="h-5 w-5" />
                {gerando ? 'Gerando o PDF…' : 'Compartilhar PDF'}
            </button>
            {pronto && !gerando && (
                <button type="button" onClick={() => entregar(pronto)} className={`${botao} bg-superficie-marcada text-tinta`}>
                    <SendIcon aria-hidden className="h-5 w-5" />
                    Enviar
                </button>
            )}
            <p role="status" aria-live="polite" className="sr-only">{gerando ? 'Gerando o PDF, aguarde.' : ''}</p>
            {erro && (
                <div role="alert" className="flex items-start gap-2 rounded-md bg-perigo-suave p-3 text-sm leading-5 text-perigo">
                    <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{erro}</p>
                </div>
            )}

            <dialog
                ref={dialogRef}
                aria-label="Prévia do cardápio em PDF"
                onCancel={(e) => { e.preventDefault(); setPreviewAberto(false) }}
                className="m-0 h-dvh max-h-none w-full max-w-none bg-superficie-marcada p-0 text-tinta open:flex open:flex-col"
            >
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-borda bg-superficie px-3 py-2">
                    <h2 className="text-[17px] font-bold">Prévia do PDF</h2>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={gerar} disabled={gerando}
                                className="flex h-11 items-center gap-2 rounded-full bg-acao px-4 text-[15px] font-semibold text-acao-contraste disabled:opacity-60">
                            <Share2Icon aria-hidden className="h-4 w-4" />
                            {gerando ? 'Gerando…' : 'Compartilhar'}
                        </button>
                        <button type="button" onClick={() => setPreviewAberto(false)} aria-label="Fechar prévia"
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-superficie-marcada">
                            <XIcon aria-hidden className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="min-h-0 flex-1 overflow-auto p-3">
                    {carregandoPreview || !html ? (
                        <p className="p-6 text-center text-[15px] text-tinta-media">Montando a prévia…</p>
                    ) : (
                        <div style={{ width: A4_LARGURA * escala, height: A4_ALTURA * escala, margin: '0 auto' }}>
                            <iframe
                                title="Prévia do cardápio"
                                srcDoc={html}
                                sandbox=""
                                style={{
                                    width: A4_LARGURA,
                                    height: A4_ALTURA,
                                    transform: `scale(${escala})`,
                                    transformOrigin: 'top left',
                                    border: 0,
                                    background: '#fff',
                                }}
                            />
                        </div>
                    )}
                </div>
            </dialog>
        </div>
    )
}
