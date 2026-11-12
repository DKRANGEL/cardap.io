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
    // Data de geração já formatada (dd/mm/aaaa), para o rodapé.
    atualizadoEm: string
}

export type TemplateDoPdf = (dados: DadosDoPdf, css: { fontes: string }) => string
