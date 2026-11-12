import { escapar } from '../escapar.ts'
import { toBRL } from '../../moeda.ts'
import type { TemplateDoPdf } from '../tipos.ts'
import { documento, marca, whatsapp } from './comum.ts'

// Compacto: duas colunas, sem fotos, pontilhado entre nome e preço. Gasta pouca tinta e cabe muito item.
const CSS = `
header { display: flex; align-items: center; gap: 10px; padding-bottom: 8px; border-bottom: 2px solid var(--cor); }
header .marca { width: 30px; height: 30px; border-radius: 7px; font-size: 12pt; background: var(--cor); color: var(--contraste); }
header img.marca { background: #fff; }
header h1 { flex: 1; font-size: 17pt; font-weight: 700; color: var(--tinta); line-height: 1.1; }
header p { font-size: 8.5pt; color: #5a5146; text-align: right; }
main { margin-top: 14px; column-count: 2; column-gap: 24px; }
section { margin-bottom: 16px; }
h2 { padding-bottom: 3px; font-size: 10.5pt; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--tinta); border-bottom: 1px solid #d9cfc0; break-after: avoid; }
.item { margin-top: 7px; break-inside: avoid; }
.linha { display: flex; align-items: baseline; gap: 6px; }
.nome { font-size: 11pt; font-weight: 600; }
.pontos { flex: 1; min-width: 10px; border-bottom: 1px dotted #b9ad9c; transform: translateY(-2px); }
.preco { font-size: 11pt; font-weight: 700; color: var(--tinta); white-space: nowrap; }
.desc { margin-top: 1px; font-size: 8.5pt; color: #786d5f; }
`

export const compacto: TemplateDoPdf = (dados, { fontes }) => {
    const secoes = dados.secoes
        .map(
            (secao) => `<section>
<h2 data-bloco="titulo">${escapar(secao.nome)}</h2>
${secao.produtos
    .map(
        (p) =>
            `<div class="item" data-bloco><div class="linha"><span class="nome">${escapar(p.nome)}</span><span class="pontos"></span><span class="preco">${escapar(toBRL(p.precoCentavos))}</span></div>${
                p.descricao ? `<div class="desc">${escapar(p.descricao)}</div>` : ''
            }</div>`,
    )
    .join('\n')}
</section>`,
        )
        .join('\n')

    const corpo = `<header data-bloco>${marca(dados)}<h1>${escapar(dados.loja.nome)}</h1><p>${whatsapp(dados)}</p></header>
<main>
${secoes}
</main>`
    return documento(dados, fontes, CSS, corpo)
}
