import { escapar } from '../escapar.ts'
import { toBRL } from '../../moeda.ts'
import type { TemplateDoPdf } from '../tipos.ts'
import { documento, imagem, marca, whatsapp } from './comum.ts'

// Clássico: faixa da cor da loja no topo, uma coluna, foto pequena à esquerda e preço à direita.
const CSS = `
header { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--cor); color: var(--contraste); border-radius: 10px; }
header .marca { width: 56px; height: 56px; border-radius: 10px; font-size: 20pt; border: 1.5px solid var(--contraste); }
header img.marca { background: #fff; border: 0; }
header h1 { font-size: 22pt; font-weight: 700; line-height: 1.1; }
header p { margin-top: 3px; font-size: 8.5pt; }
section { margin-top: 18px; }
h2 { padding-bottom: 4px; font-size: 14pt; font-weight: 700; color: var(--tinta); border-bottom: 2px solid var(--cor); break-after: avoid; }
.item { display: flex; align-items: center; gap: 12px; padding: 7px 0; border-bottom: 1px solid #ece5da; break-inside: avoid; }
.item img { width: 56px; height: 56px; object-fit: cover; border-radius: 8px; flex: none; }
.texto { flex: 1; min-width: 0; }
.nome { font-size: 11.5pt; font-weight: 600; }
.desc { margin-top: 2px; font-size: 9pt; color: #786d5f; }
.preco { font-size: 12pt; font-weight: 700; color: var(--tinta); white-space: nowrap; }
`

export const classico: TemplateDoPdf = (dados, { fontes }) => {
    const secoes = dados.secoes
        .map(
            (secao) => `<section>
<h2 data-bloco="titulo">${escapar(secao.nome)}</h2>
${secao.produtos
    .map((p) => {
        const foto = imagem(p.foto)
        return `<div class="item" data-bloco>${foto ? `<img src="${foto}" alt="">` : ''}<div class="texto"><div class="nome">${escapar(p.nome)}</div>${
            p.descricao ? `<div class="desc">${escapar(p.descricao)}</div>` : ''
        }</div><div class="preco">${escapar(toBRL(p.precoCentavos))}</div></div>`
    })
    .join('\n')}
</section>`,
        )
        .join('\n')

    const corpo = `<header data-bloco>${marca(dados)}<div><h1>${escapar(dados.loja.nome)}</h1><p>${whatsapp(dados)}</p></div></header>
${secoes}`
    return documento(dados, fontes, CSS, corpo)
}
