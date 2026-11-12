import { escapar } from '../escapar.ts'
import { toBRL } from '../../moeda.ts'
import type { TemplateDoPdf } from '../tipos.ts'
import { documento, marca, whatsapp } from './comum.ts'

// Destaque: faixa cheia da cor da loja a cada categoria, uma coluna, sem foto e com texto grande,
// pensado para ler no celular sem precisar de zoom.
const CSS = `
header { display: flex; align-items: center; gap: 14px; padding-bottom: 12px; border-bottom: 2px solid var(--cor); }
header .marca { width: 48px; height: 48px; border-radius: 10px; font-size: 20pt; background: var(--cor); color: var(--contraste); }
header img.marca { background: #fff; }
header h1 { font-size: 22pt; font-weight: 700; line-height: 1.1; }
header p { margin-top: 3px; font-size: 9pt; color: #786d5f; }
section { margin-top: 22px; }
h2 { padding: 8px 14px; font-size: 15pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--contraste); background: var(--cor); border-radius: 8px; break-after: avoid; }
.item { display: flex; align-items: baseline; gap: 14px; padding: 9px 4px; border-bottom: 1px solid #ece5da; break-inside: avoid; }
.texto { flex: 1; min-width: 0; }
.nome { font-size: 13pt; font-weight: 600; }
.desc { margin-top: 2px; font-size: 10pt; color: #786d5f; }
.preco { font-size: 13pt; font-weight: 700; color: var(--tinta); white-space: nowrap; }
`

export const destaque: TemplateDoPdf = (dados, { fontes }) => {
    const secoes = dados.secoes
        .map(
            (secao) => `<section>
<h2 data-bloco="titulo">${escapar(secao.nome)}</h2>
${secao.produtos
    .map(
        (p) =>
            `<div class="item" data-bloco><div class="texto"><div class="nome">${escapar(p.nome)}</div>${
                p.descricao ? `<div class="desc">${escapar(p.descricao)}</div>` : ''
            }</div><div class="preco">${escapar(toBRL(p.precoCentavos))}</div></div>`,
    )
    .join('\n')}
</section>`,
        )
        .join('\n')

    const corpo = `<header data-bloco>${marca(dados)}<div><h1>${escapar(dados.loja.nome)}</h1><p>${whatsapp(dados)}</p></div></header>
${secoes}`
    return documento(dados, fontes, CSS, corpo)
}
