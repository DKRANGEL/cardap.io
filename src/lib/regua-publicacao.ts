export const MINIMO_PRODUTOS = 5

export type EstadoDaLoja = {
    loja: { nome: string; slug: string; whatsapp: string; divulgado_em: string | null } | null
    totalCategorias: number
    totalProdutos: number
}

export type IdPasso = 'loja' | 'categoria' | 'produtos' | 'divulgar'

export type Passo = {
    id: IdPasso
    titulo: string
    detalhe: string
    pronto: boolean
    href: string
}

export type Regua = {
    passos: Passo[]
    atual: IdPasso | null
    concluidos: number
    completa: boolean
}

const plural = (n: number, singular: string, pluralForm: string) => (n === 1 ? singular : pluralForm)

function detalheDeProdutos(total: number) {
    if (total === 0) return `Cadastre pelo menos ${MINIMO_PRODUTOS} produtos pro cardápio ficar bom.`
    if (total >= MINIMO_PRODUTOS) return `Você tem ${total} ${plural(total, 'produto', 'produtos')}.`
    const faltam = MINIMO_PRODUTOS - total
    return `Você tem ${total}. ${plural(faltam, 'Falta', 'Faltam')} ${faltam}.`
}

export function calcularRegua({ loja, totalCategorias, totalProdutos }: EstadoDaLoja): Regua {
    const lojaCriada = Boolean(loja?.nome && loja.slug && loja.whatsapp)

    const passos: Passo[] = [
        {
            id: 'loja',
            titulo: 'Criar a loja',
            detalhe: lojaCriada ? 'Nome, endereço e WhatsApp definidos.' : 'Defina o nome, o endereço e o WhatsApp.',
            pronto: lojaCriada,
            href: '/painel/loja',
        },
        {
            id: 'categoria',
            titulo: 'Criar uma categoria',
            detalhe:
                totalCategorias > 0
                    ? `Você tem ${totalCategorias} ${plural(totalCategorias, 'categoria', 'categorias')}.`
                    : 'Separe o cardápio em grupos, como Lanches e Bebidas.',
            pronto: totalCategorias >= 1,
            href: '/painel/cardapio',
        },
        {
            id: 'produtos',
            titulo: `Cadastrar ${MINIMO_PRODUTOS} produtos`,
            detalhe: detalheDeProdutos(totalProdutos),
            pronto: totalProdutos >= MINIMO_PRODUTOS,
            href: '/painel/cardapio',
        },
        {
            id: 'divulgar',
            titulo: 'Divulgar o cardápio',
            detalhe: loja?.divulgado_em ? 'Você já abriu o link e o QR code.' : 'Pegue o link e o QR code pra compartilhar.',
            pronto: Boolean(loja?.divulgado_em),
            href: '/painel/divulgar',
        },
    ]

    const concluidos = passos.filter((p) => p.pronto).length
    const primeiroPendente = passos.find((p) => !p.pronto)

    return {
        passos,
        atual: primeiroPendente?.id ?? null,
        concluidos,
        completa: concluidos === passos.length,
    }
}
