import type { SecaoDoPdf } from './tipos.ts'

type CategoriaBruta = { id: string; nome: string; ordem: number }
type ProdutoBruto = {
    categoria_id: string | null
    nome: string
    descricao: string | null
    preco_centavos: number
    foto_url: string | null
    ordem: number
    ativo?: boolean
}

export const SECAO_SEM_CATEGORIA = 'Outros'

// Mesma regra do cardápio público: categorias e produtos por `ordem`, só produtos ativos,
// categoria vazia some e produto sem categoria cai em "Outros" no fim.
export function agruparProdutos(
    categorias: CategoriaBruta[],
    produtos: ProdutoBruto[],
    fotoDe: (url: string | null) => string | null = () => null,
): SecaoDoPdf[] {
    const porOrdem = <T extends { ordem: number }>(a: T, b: T) => a.ordem - b.ordem
    const ativos = produtos.filter((p) => p.ativo !== false).sort(porOrdem)
    const paraItem = (p: ProdutoBruto) => ({
        nome: p.nome,
        descricao: p.descricao,
        precoCentavos: p.preco_centavos,
        foto: fotoDe(p.foto_url),
    })

    const secoes: SecaoDoPdf[] = [...categorias].sort(porOrdem).map((c) => ({
        nome: c.nome,
        produtos: ativos.filter((p) => p.categoria_id === c.id).map(paraItem),
    }))

    const ids = new Set(categorias.map((c) => c.id))
    const soltos = ativos.filter((p) => !p.categoria_id || !ids.has(p.categoria_id)).map(paraItem)
    if (soltos.length > 0) secoes.push({ nome: SECAO_SEM_CATEGORIA, produtos: soltos })

    return secoes.filter((s) => s.produtos.length > 0)
}
