import { escapar } from '../escapar.ts'
import { toBRL } from '../../moeda.ts'
import type { DadosDoPdf, TemplateDoPdf } from '../tipos.ts'

// Template neutro e provisório: lista em texto, A4, sem nenhuma referência externa.
// A cor da loja entra por variáveis CSS; só valores hexadecimais validados chegam aqui.
const HEX = /^#[0-9a-f]{6}$/i
const cor = (valor: string, padrao: string) => (HEX.test(valor) ? valor : padrao)
const imagem = (uri: string | null) => (uri && /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(uri) ? uri : null)

function css(dados: DadosDoPdf, fontes: string) {
    return `${fontes}
@page { size: A4; margin: 10mm; }
:root { --cor: ${cor(dados.loja.cor, '#bd3f0d')}; --contraste: ${cor(dados.loja.contraste, '#fffdfa')}; --tinta: ${cor(dados.loja.tinta, '#9a330f')}; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Archivo', sans-serif; font-size: 11pt; color: #1c1814; }
header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: var(--cor); color: var(--contraste); border-radius: 10px; }
header img { width: 56px; height: 56px; object-fit: contain; border-radius: 8px; background: #fff; }
header h1 { margin: 0; font-size: 22pt; font-weight: 700; }
header p { margin: 2px 0 0; font-size: 10pt; }
section { margin-top: 16px; }
h2 { margin: 0 0 6px; padding-bottom: 4px; font-size: 14pt; font-weight: 700; color: var(--tinta); border-bottom: 2px solid var(--cor); break-after: avoid; }
.item { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid #e6ded2; break-inside: avoid; }
.item img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; flex: none; }
.texto { flex: 1; min-width: 0; }
.nome { font-weight: 600; }
.desc { margin-top: 2px; font-size: 9.5pt; color: #5a5146; }
.preco { font-weight: 700; white-space: nowrap; }
`
}

export const provisorio: TemplateDoPdf = (dados, { fontes }) => {
    const logo = imagem(dados.loja.logo)
    const secoes = dados.secoes
        .map(
            (secao) => `<section>
<h2>${escapar(secao.nome)}</h2>
${secao.produtos
    .map((p) => {
        const foto = imagem(p.foto)
        return `<div class="item">${foto ? `<img src="${foto}" alt="">` : ''}<div class="texto"><div class="nome">${escapar(p.nome)}</div>${
            p.descricao ? `<div class="desc">${escapar(p.descricao)}</div>` : ''
        }</div><div class="preco">${escapar(toBRL(p.precoCentavos))}</div></div>`
    })
    .join('\n')}
</section>`,
        )
        .join('\n')

    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${escapar(dados.loja.nome)}</title>
<style>${css(dados, fontes)}</style>
</head>
<body>
<header>${logo ? `<img src="${logo}" alt="">` : ''}<div><h1>${escapar(dados.loja.nome)}</h1><p>WhatsApp ${escapar(dados.loja.whatsapp)}</p></div></header>
${secoes}
</body>
</html>`
}
