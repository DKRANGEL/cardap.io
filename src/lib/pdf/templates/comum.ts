import { escapar } from '../escapar.ts'
import type { DadosDoPdf } from '../tipos.ts'

// Blindagem compartilhada pelos modelos: só cor hexadecimal e só imagem em data URI chegam ao HTML.
const HEX = /^#[0-9a-f]{6}$/i
export const cor = (valor: string, padrao: string) => (HEX.test(valor) ? valor : padrao)
export const imagem = (uri: string | null) =>
    uri && /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(uri) ? uri : null

export const inicialDaLoja = (nome: string) => (Array.from(nome.trim())[0] ?? '·').toLocaleUpperCase('pt-BR')

// Logo da loja; sem logo, a inicial do nome dentro da caixa. `.marca` é estilizada por cada modelo.
export function marca(dados: DadosDoPdf) {
    const logo = imagem(dados.loja.logo)
    return logo
        ? `<img class="marca" src="${logo}" alt="">`
        : `<div class="marca" aria-hidden="true">${escapar(inicialDaLoja(dados.loja.nome))}</div>`
}

export const whatsapp = (dados: DadosDoPdf) => (dados.loja.whatsapp ? `WhatsApp ${escapar(dados.loja.whatsapp)}` : '')

export function rodape(dados: DadosDoPdf) {
    return `<footer data-bloco><span>Atualizado em ${escapar(dados.atualizadoEm)}. Os preços podem mudar.</span><span>cardápio feito com <b>cardap.io</b></span></footer>`
}

// Regras comuns: variáveis de cor, página A4, e na tela (prévia e fallback) a mesma margem de 10mm.
function cssBase(dados: DadosDoPdf) {
    return `@page { size: A4; margin: 10mm; @bottom-left { content: "Atualizado em ${dados.atualizadoEm.replace(/[^0-9/]/g, '')}. Os preços podem mudar."; font: 7.5pt 'Archivo', sans-serif; color: #786d5f; vertical-align: middle; } @bottom-right { content: "cardápio feito com cardap.io"; font: 7.5pt 'Archivo', sans-serif; color: #786d5f; vertical-align: middle; } }
:root { --cor: ${cor(dados.loja.cor, '#bd3f0d')}; --contraste: ${cor(dados.loja.contraste, '#fffdfa')}; --tinta: ${cor(dados.loja.tinta, '#9a330f')}; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Archivo', sans-serif; font-size: 11pt; color: #1c1814; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
@media screen { body { padding: 10mm; } }
h1, h2, p { margin: 0; }
.marca { flex: none; display: flex; align-items: center; justify-content: center; font-weight: 700; object-fit: contain; }
footer { break-inside: avoid; display: flex; justify-content: space-between; gap: 12px; margin-top: 10px; padding-top: 6px; border-top: 1px solid #e6ded2; font-size: 7.5pt; color: #786d5f; }
@media print { footer { display: none; } }
`
}

export function documento(dados: DadosDoPdf, fontes: string, css: string, corpo: string) {
    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${escapar(dados.loja.nome)}</title>
<style>${fontes}
${cssBase(dados)}${css}</style>
</head>
<body>
${corpo}
${rodape(dados)}
</body>
</html>`
}
