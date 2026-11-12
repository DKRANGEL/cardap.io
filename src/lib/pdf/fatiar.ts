// Decide onde cortar o cardápio em páginas A4 no fallback do navegador (a imagem é uma só, comprida).
// Medidas em px, no mesmo eixo vertical do conteúdo (0 = topo do primeiro bloco da página).
export type BlocoMedido = {
    topo: number
    base: number
    // Título de seção: não pode ficar sozinho no fim da página, sai junto com o que vem depois.
    colar?: boolean
}

export type Fatia = { inicio: number; fim: number }

const FOLGA = 0.5

// Corta no fim do último bloco inteiro que cabe na página. Nunca corta no meio de um bloco (item, card,
// cabeçalho); só se um único bloco for maior que a página é que o corte é seco. Também funciona com
// blocos lado a lado (2 colunas): um corte só vale se nenhum bloco, em nenhuma coluna, o atravessar.
export function fatiarPaginas(blocos: BlocoMedido[], total: number, alturaPagina: number): Fatia[] {
    const medidos = blocos.filter((b) => b.base - b.topo > FOLGA).sort((a, b) => a.topo - b.topo)
    const atravessa = (corte: number) => medidos.some((b) => b.topo < corte - FOLGA && b.base > corte + FOLGA)

    const fatias: Fatia[] = []
    let inicio = medidos.length > 0 ? Math.min(medidos[0].topo, total) : 0

    while (total - inicio > alturaPagina + FOLGA) {
        const limite = inicio + alturaPagina
        let corte = -1
        for (const b of medidos) {
            if (b.base > inicio + FOLGA && b.base <= limite + FOLGA && b.base > corte && !atravessa(b.base)) corte = b.base
        }

        // Título no fim da página vai para a página seguinte, junto com o primeiro item.
        for (;;) {
            const titulo = medidos.find((b) => b.colar && Math.abs(b.base - corte) <= FOLGA && b.topo > inicio + FOLGA)
            if (!titulo) break
            corte = titulo.topo
        }

        if (corte <= inicio + FOLGA) corte = limite
        fatias.push({ inicio, fim: corte })

        // A página seguinte começa no próximo bloco, sem herdar o vão em branco entre eles.
        const proximo = medidos.find((b) => b.topo >= corte - FOLGA)
        inicio = proximo && proximo.topo < total ? proximo.topo : corte
    }

    fatias.push({ inicio, fim: total })
    return fatias
}
