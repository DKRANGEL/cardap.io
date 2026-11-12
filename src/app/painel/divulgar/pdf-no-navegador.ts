import { fatiarPaginas, type BlocoMedido } from '@/lib/pdf/fatiar'

// Contingência quando o servidor não entrega o PDF: monta o PDF aqui no navegador a partir do mesmo HTML
// da prévia. Fica como uma foto do cardápio (sem texto selecionável), por isso só entra com o aval do lojista.
// html2canvas e jsPDF são pesados: só são baixados quando esta função roda.

const A4_LARGURA_PX = 794
const MARGEM_MM = 10
const A4_MM = { largura: 210, altura: 297 }
const FOLGA_FINAL_PX = 6 // sobra no fim do último recorte, dentro da margem inferior do corpo
const MAX_PIXELS = 12_000_000 // teto do canvas (iOS Safari é o mais apertado)

const esperarCarregar = (iframe: HTMLIFrameElement) =>
    new Promise<void>((resolve, reject) => {
        const limite = setTimeout(() => reject(new Error('tempo esgotado')), 15_000)
        iframe.addEventListener('load', () => {
            clearTimeout(limite)
            resolve()
        }, { once: true })
    })

// O html2canvas ignora object-fit e estica a imagem. Troca cada <img> com object-fit por uma <div> com o
// mesmo tamanho e background-size equivalente.
function trocarImagensComObjectFit(doc: Document) {
    const janela = doc.defaultView
    if (!janela) return
    for (const img of Array.from(doc.images)) {
        const estilo = janela.getComputedStyle(img)
        if (estilo.objectFit !== 'cover' && estilo.objectFit !== 'contain') continue
        const caixa = img.getBoundingClientRect()
        const div = doc.createElement('div')
        div.className = img.className
        div.style.cssText = [
            `width:${caixa.width}px`,
            `height:${caixa.height}px`,
            'flex:none',
            'display:block',
            `border-radius:${estilo.borderRadius}`,
            `background-color:${estilo.backgroundColor}`,
            `background-image:url("${img.currentSrc || img.src}")`,
            `background-size:${estilo.objectFit}`,
            'background-position:center',
            'background-repeat:no-repeat',
        ].join(';')
        img.replaceWith(div)
    }
}

// O html2canvas desenha o texto alguns px abaixo do que o navegador calcula quando a altura da linha é "normal"
// (o traço do título cortava as letras e o rodapé saía cortado). Com line-height explícito os dois coincidem.
function fixarAlturaDasLinhas(doc: Document) {
    const janela = doc.defaultView
    if (!janela) return
    for (const el of Array.from(doc.body.querySelectorAll<HTMLElement>('*'))) {
        const estilo = janela.getComputedStyle(el)
        if (estilo.lineHeight === 'normal') el.style.lineHeight = `${Math.round(parseFloat(estilo.fontSize) * 1.2 * 100) / 100}px`
        // Mesmo assim o texto dos títulos sai ~4px abaixo e o traço da seção passava por cima das letras.
        if (el.tagName === 'H2') el.style.paddingBottom = `${(parseFloat(estilo.paddingBottom) || 0) + 4}px`
    }
}

export async function gerarPdfNoNavegador(html: string, nomeArquivo: string): Promise<File> {
    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.tabIndex = -1
    // Sem scripts (só leitura pelo pai); fora da tela, na largura exata da folha A4.
    iframe.sandbox.add('allow-same-origin')
    iframe.style.cssText = `position:fixed;left:-10000px;top:0;width:${A4_LARGURA_PX}px;height:1123px;border:0;opacity:0;pointer-events:none`
    const carregou = esperarCarregar(iframe)
    iframe.srcdoc = html
    document.body.appendChild(iframe)

    try {
        await carregou
        const doc = iframe.contentDocument
        const janela = iframe.contentWindow
        if (!doc || !janela) throw new Error('prévia indisponível')

        await doc.fonts.ready
        await Promise.all(Array.from(doc.images).map((img) => img.decode().catch(() => undefined)))
        trocarImagensComObjectFit(doc)
        fixarAlturaDasLinhas(doc)

        const corpo = doc.body
        const estiloCorpo = janela.getComputedStyle(corpo)
        const margemEsq = parseFloat(estiloCorpo.paddingLeft) || 0
        const margemTopo = parseFloat(estiloCorpo.paddingTop) || 0
        const larguraUtil = A4_LARGURA_PX - margemEsq - (parseFloat(estiloCorpo.paddingRight) || 0)
        const topoCorpo = corpo.getBoundingClientRect().top
        const totalUtil = corpo.getBoundingClientRect().height - margemTopo - (parseFloat(estiloCorpo.paddingBottom) || 0)

        // Cada página leva a altura útil da folha (A4 menos as margens) na mesma escala da largura.
        const alturaPaginaPx = (A4_MM.altura - 2 * MARGEM_MM) * (larguraUtil / (A4_MM.largura - 2 * MARGEM_MM))
        const blocos: BlocoMedido[] = Array.from(doc.querySelectorAll<HTMLElement>('[data-bloco]')).map((el) => {
            const caixa = el.getBoundingClientRect()
            return {
                topo: caixa.top - topoCorpo - margemTopo,
                base: caixa.bottom - topoCorpo - margemTopo,
                colar: el.dataset.bloco === 'titulo',
            }
        })
        const fatias = fatiarPaginas(blocos, totalUtil + FOLGA_FINAL_PX, alturaPaginaPx)

        const alturaTotalPx = corpo.getBoundingClientRect().height
        const escala = Math.min(2, Math.sqrt(MAX_PIXELS / (A4_LARGURA_PX * alturaTotalPx)))
        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
        const tela = await html2canvas(corpo, {
            scale: escala,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: A4_LARGURA_PX,
            windowHeight: Math.ceil(alturaTotalPx),
        })

        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true })
        const larguraMm = A4_MM.largura - 2 * MARGEM_MM
        fatias.forEach((fatia, i) => {
            const alturaPx = fatia.fim - fatia.inicio
            if (alturaPx < 1) return
            const recorte = document.createElement('canvas')
            recorte.width = Math.round(larguraUtil * escala)
            recorte.height = Math.max(1, Math.round(alturaPx * escala))
            const contexto = recorte.getContext('2d')
            if (!contexto) throw new Error('canvas indisponível')
            contexto.fillStyle = '#ffffff'
            contexto.fillRect(0, 0, recorte.width, recorte.height)
            contexto.drawImage(
                tela,
                Math.round(margemEsq * escala),
                Math.round((margemTopo + fatia.inicio) * escala),
                recorte.width,
                recorte.height,
                0,
                0,
                recorte.width,
                recorte.height,
            )
            if (i > 0) pdf.addPage()
            pdf.addImage(recorte.toDataURL('image/jpeg', 0.85), 'JPEG', MARGEM_MM, MARGEM_MM, larguraMm, alturaPx * (larguraMm / larguraUtil))
        })

        return new File([pdf.output('blob')], nomeArquivo, { type: 'application/pdf' })
    } finally {
        iframe.remove()
    }
}
