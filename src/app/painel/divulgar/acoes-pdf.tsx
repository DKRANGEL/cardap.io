'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircleIcon, EyeIcon, FileTextIcon, Share2Icon, XIcon } from 'lucide-react'
import { MODELOS, TEMPLATE_PADRAO, temTemplate, type ModeloId } from '@/lib/pdf/modelos'
import { gerarPdfNoNavegador } from './pdf-no-navegador'

const URL_PDF = '/painel/divulgar/pdf'
const A4_LARGURA = 794
const A4_ALTURA = 1123
const CHAVE_MODELO = 'cardapio:modelo-pdf'

type Props = { slug: string }

export function AcoesPdf({ slug }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const pedidoRef = useRef(0)
    const arquivosRef = useRef(new Map<ModeloId, File>())
    const geracoesRef = useRef(new Map<ModeloId, Promise<File>>())
    const [aguardandoToque, setAguardandoToque] = useState<ModeloId | null>(null)
    const [podeSimplificar, setPodeSimplificar] = useState(false)
    const [simplificando, setSimplificando] = useState(false)
    const prontosRef = useRef(new Map<ModeloId, string>())
    const pendentesRef = useRef(new Map<ModeloId, Promise<string>>())
    const [previewAberto, setPreviewAberto] = useState(false)
    const [html, setHtml] = useState<string | null>(null)
    const [modelo, setModelo] = useState<ModeloId>(TEMPLATE_PADRAO)
    const [escala, setEscala] = useState(1)
    const [gerando, setGerando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [carregandoPreview, setCarregandoPreview] = useState(false)
    const nomeArquivo = `cardapio-${slug}.pdf`

    // A última escolha do lojista fica neste navegador (sem banco, sem migration).
    useEffect(() => {
        try {
            const guardado = localStorage.getItem(CHAVE_MODELO)
            if (guardado && temTemplate(guardado)) setModelo(guardado)
        } catch {
            // navegador sem armazenamento: segue com o modelo padrão
        }
    }, [])

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

    // Cada modelo é montado uma vez por visita à tela: depois disso a troca é instantânea, sem pedir ao
    // servidor. `pendentes` evita pedir duas vezes o mesmo modelo se o lojista alternar rápido.
    const buscarPreview = (id: ModeloId) => {
        let pendente = pendentesRef.current.get(id)
        if (!pendente) {
            pendente = fetch(`${URL_PDF}?formato=html&template=${id}`)
                .then((res) => {
                    if (!res.ok) throw new Error()
                    return res.text()
                })
                .then((texto) => {
                    prontosRef.current.set(id, texto)
                    return texto
                })
                .finally(() => pendentesRef.current.delete(id))
            pendentesRef.current.set(id, pendente)
        }
        return pendente
    }

    // Só a resposta do pedido mais recente vale: trocar de modelo rápido não deixa a prévia velha voltar.
    const carregarPreview = async (id: ModeloId) => {
        const pedido = ++pedidoRef.current
        setErro(null)
        const pronto = prontosRef.current.get(id)
        if (pronto !== undefined) {
            setHtml(pronto)
            setCarregandoPreview(false)
            return
        }
        setCarregandoPreview(true)
        try {
            const texto = await buscarPreview(id)
            if (pedido !== pedidoRef.current) return
            setHtml(texto)
            setCarregandoPreview(false)
        } catch {
            if (pedido !== pedidoRef.current) return
            setCarregandoPreview(false)
            setPreviewAberto(false)
            setErro('Não foi possível carregar a prévia. Confira a conexão e tente de novo.')
        }
    }

    const abrirPreview = () => {
        setPreviewAberto(true)
        void carregarPreview(modelo)
        prepararPdf(modelo).catch(() => {}) // se falhar, o toque em Compartilhar tenta de novo e mostra o erro
    }

    const escolherModelo = (id: ModeloId) => {
        if (id === modelo) return
        setModelo(id)
        try {
            localStorage.setItem(CHAVE_MODELO, id)
        } catch {
            // sem armazenamento: vale só nesta visita
        }
        void carregarPreview(id)
        prepararPdf(id).catch(() => {})
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

    // O PDF de cada modelo é gerado uma vez e fica guardado. A prévia já o prepara em segundo plano, assim o
    // toque em Compartilhar abre a folha do sistema na hora (o navegador só deixa compartilhar logo após o toque).
    const prepararPdf = (id: ModeloId) => {
        const pronto = arquivosRef.current.get(id)
        if (pronto) return Promise.resolve(pronto)
        let geracao = geracoesRef.current.get(id)
        if (!geracao) {
            geracao = (async () => {
                const controle = new AbortController()
                const limite = setTimeout(() => controle.abort(), 25_000)
                try {
                    const res = await fetch(`${URL_PDF}?template=${id}`, { signal: controle.signal })
                    if (!res.ok || !res.headers.get('content-type')?.includes('application/pdf')) throw new Error()
                    const arquivo = new File([await res.blob()], nomeArquivo, { type: 'application/pdf' })
                    arquivosRef.current.set(id, arquivo)
                    return arquivo
                } finally {
                    clearTimeout(limite)
                    geracoesRef.current.delete(id)
                }
            })()
            geracoesRef.current.set(id, geracao)
        }
        return geracao
    }

    // Abre a folha de compartilhar do sistema (WhatsApp, Drive, e-mail...). Só baixa quando o aparelho
    // não sabe compartilhar arquivo (computador, ou site aberto sem HTTPS).
    const entregar = async (arquivo: File, id: ModeloId) => {
        if (typeof navigator.canShare !== 'function' || !navigator.canShare({ files: [arquivo] })) {
            baixar(arquivo)
            return
        }
        try {
            await navigator.share({ files: [arquivo], title: arquivo.name })
            setAguardandoToque(null)
        } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') {
                setAguardandoToque(null)
            } else if (e instanceof DOMException && e.name === 'NotAllowedError') {
                // Demorou e o navegador pediu um novo toque: o PDF fica pronto e o mesmo botão abre a folha.
                setAguardandoToque(id)
            } else {
                baixar(arquivo)
            }
        }
    }

    const gerar = async () => {
        setErro(null)
        setPodeSimplificar(false)
        const id = modelo
        const pronto = arquivosRef.current.get(id)
        if (pronto) {
            // Sem nenhum await antes: o toque ainda vale e a folha do sistema abre.
            await entregar(pronto, id)
            return
        }
        setGerando(true)
        try {
            await entregar(await prepararPdf(id), id)
        } catch {
            setErro('Não foi possível gerar o PDF agora. Tente de novo em instantes.')
            setPodeSimplificar(true)
        } finally {
            setGerando(false)
        }
    }

    // Contingência: só roda quando o lojista toca no botão. Monta o PDF aqui no navegador (como uma foto do
    // cardápio) e entrega pelo mesmo caminho de compartilhar. Fica guardado: se o navegador pedir outro toque
    // para abrir a folha do sistema, o botão principal compartilha na hora.
    const gerarSimplificado = async () => {
        const id = modelo
        setErro(null)
        setSimplificando(true)
        try {
            const pronto = prontosRef.current.get(id) ?? (await buscarPreview(id))
            const arquivo = await gerarPdfNoNavegador(pronto, nomeArquivo)
            arquivosRef.current.set(id, arquivo)
            setPodeSimplificar(false)
            await entregar(arquivo, id)
        } catch {
            setErro('Não foi possível gerar nem a versão simplificada. Confira a conexão e tente de novo.')
            setPodeSimplificar(true)
        } finally {
            setSimplificando(false)
        }
    }

    const aguardando = aguardandoToque === modelo
    const rotuloBotao = gerando ? 'Gerando o PDF…' : aguardando ? 'Escolher o aplicativo' : 'Compartilhar PDF'
    const rotuloCurto = gerando ? 'Gerando…' : aguardando ? 'Escolher app' : 'Compartilhar'

    const botao = 'flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-base font-semibold disabled:opacity-60'

    return (
        <div className="flex flex-col gap-3">
            <button type="button" onClick={abrirPreview} className={`${botao} bg-superficie-marcada text-tinta`}>
                <EyeIcon aria-hidden className="h-5 w-5" />
                Ver cardápio
            </button>
            <button type="button" onClick={gerar} disabled={gerando} className={`${botao} bg-acao text-acao-contraste`}>
                <Share2Icon aria-hidden className="h-5 w-5" />
                {rotuloBotao}
            </button>
            {aguardando && (
                <p className="text-sm leading-5 text-tinta-media">O PDF está pronto. Toque de novo para escolher o aplicativo.</p>
            )}
            <p role="status" aria-live="polite" className="sr-only">
                {gerando ? 'Gerando o PDF, aguarde.' : simplificando ? 'Gerando a versão simplificada, aguarde.' : ''}
            </p>
            {erro && (
                <div role="alert" className="flex items-start gap-2 rounded-md bg-perigo-suave p-3 text-sm leading-5 text-perigo">
                    <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{erro}</p>
                </div>
            )}
            {(podeSimplificar || simplificando) && (
                <div className="flex flex-col gap-2">
                    <button type="button" onClick={gerarSimplificado} disabled={simplificando}
                            className={`${botao} bg-superficie-marcada text-tinta`}>
                        <FileTextIcon aria-hidden className="h-5 w-5" />
                        {simplificando ? 'Gerando a versão simplificada…' : 'Gerar versão simplificada'}
                    </button>
                    <p className="text-sm leading-5 text-tinta-media">
                        Sai com qualidade menor, como uma foto do cardápio, mas funciona mesmo sem o servidor.
                    </p>
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
                            {rotuloCurto}
                        </button>
                        <button type="button" onClick={() => setPreviewAberto(false)} aria-label="Fechar prévia"
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-superficie-marcada">
                            <XIcon aria-hidden className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <fieldset className="shrink-0 border-b border-borda bg-superficie px-3 py-2">
                    <legend className="sr-only">Modelo do PDF</legend>
                    <div className="flex gap-2 overflow-x-auto">
                        {MODELOS.map((m) => (
                            <label key={m.id} className="shrink-0">
                                <input
                                    type="radio"
                                    name="modelo-pdf"
                                    value={m.id}
                                    checked={modelo === m.id}
                                    onChange={() => escolherModelo(m.id)}
                                    className="peer sr-only"
                                />
                                <span className="flex h-11 cursor-pointer items-center rounded-full bg-superficie-marcada px-4 text-[15px] font-semibold text-tinta peer-checked:bg-acao peer-checked:text-acao-contraste peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-acao">
                                    {m.nome}
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>
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
