export type Loja = {
    id: string
    slug: string
    nome: string
    whatsapp: string
    cor_primaria: string | null
    cor_contraste: string | null
    cor_tinta: string | null
    logo_url: string | null
}

export type Categoria = {
    id: string
    nome: string
    ordem: number
}

export type Produto = {
    id: string
    categoria_id: string | null
    nome: string
    descricao: string | null
    preco_centavos: number
    foto_url: string | null
    ordem: number
}
