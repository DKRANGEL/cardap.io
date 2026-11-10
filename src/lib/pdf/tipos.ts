export type ProdutoDoPdf = {
    nome: string
    descricao: string | null
    precoCentavos: number
    foto: string | null
}

export type SecaoDoPdf = {
    nome: string
    produtos: ProdutoDoPdf[]
}

export type DadosDoPdf = {
    loja: {
        nome: string
        whatsapp: string
        cor: string
        contraste: string
        tinta: string
        logo: string | null
    }
    secoes: SecaoDoPdf[]
}

export type TemplateDoPdf = (dados: DadosDoPdf, css: { fontes: string }) => string
