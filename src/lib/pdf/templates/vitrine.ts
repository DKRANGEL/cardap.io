import { escapar } from '../escapar.ts'
import { toBRL } from '../../moeda.ts'
import type { TemplateDoPdf } from '../tipos.ts'
import { documento, imagem, inicialDaLoja, marca, whatsapp } from './comum.ts'

// Vitrine: cards em duas colunas com foto grande (miniatura de 320px, ver modelos.ts).
// Produto sem foto vira um bloco da cor da loja bem clara com a inicial do nome.
const CSS = `
header { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--cor); color: var(--contraste); border-radius: 10px; }
header .marca { width: 36px; height: 36px; border-radius: 8px; font-size: 14pt; border: 1.5px solid var(--contraste); }
header img.marca { background: #fff; border: 0; }
header h1 { font-size: 17pt; font-weight: 700; line-height: 1.1; }
header p { margin-top: 2px; font-size: 8pt; }
section { margin-top: 14px; }
h2 { margin-bottom: 6px; padding-bottom: 4px; font-size: 13.5pt; font-weight: 700; color: var(--tinta); border-bottom: 2px solid var(--cor); break-after: avoid; }
.grade { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.card { border: 1px solid #e6ded2; border-radius: 10px; overflow: hidden; break-inside: avoid; background: #fff; }
.foto { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; }
.sem-foto { display: flex; align-items: center; justify-content: center; font-size: 34pt; font-weight: 700; color: var(--tinta); background: color-mix(in srgb, var(--cor) 14%, #fff); }
.info { padding: 6px 9px 8px; }
.nome { font-size: 11.5pt; font-weight: 700; }
.desc { margin-top: 3px; font-size: 8.5pt; line-height: 1.3; color: #786d5f; }
.preco { margin-top: 4px; font-size: 12.5pt; font-weight: 700; color: var(--tinta); }
`

export const vitrine: TemplateDoPdf = (dados, { fontes }) => {
    const secoes = dados.secoes
        .map(
            (secao) => `<section>
<h2 data-bloco="titulo">${escapar(secao.nome)}</h2>
<div class="grade">
${secao.produtos
    .map((p) => {
        const foto = imagem(p.foto)
        const topo = foto
            ? `<img class="foto" src="${foto}" alt="">`
            : `<div class="foto sem-foto" aria-hidden="true">${escapar(inicialDaLoja(p.nome))}</div>`
        return `<div class="card" data-bloco>${topo}<div class="info"><div class="nome">${escapar(p.nome)}</div>${
            p.descricao ? `<div class="desc">${escapar(p.descricao)}</div>` : ''
        }<div class="preco">${escapar(toBRL(p.precoCentavos))}</div></div></div>`
    })
    .join('\n')}
</div>
</section>`,
        )
        .join('\n')

    const corpo = `<header data-bloco>${marca(dados)}<div><h1>${escapar(dados.loja.nome)}</h1><p>${whatsapp(dados)}</p></div></header>
${secoes}`
    return documento(dados, fontes, CSS, corpo)
}
