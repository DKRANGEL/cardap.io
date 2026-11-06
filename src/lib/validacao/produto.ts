import { z } from 'zod'

export const PRECO_MAX_CENTAVOS = 999_999
export const NOME_PRODUTO_MAX = 60
export const DESCRICAO_PRODUTO_MAX = 140

const DIGITOS_DO_PRECO_MAX = String(PRECO_MAX_CENTAVOS).length

// "R$ 27,90", "2790" e "27,90" viram 2790: só os dígitos contam, o resto é máscara.
export function centavosDoTexto(texto: string): number {
    const digitos = texto.replace(/\D/g, '').replace(/^0+/, '')
    return digitos ? parseInt(digitos, 10) : 0
}

// Máscara do campo de preço: o que a pessoa digita entra pela direita (2 -> 0,02; 27 -> 0,27; 2790 -> 27,90)
// e passar do teto é ignorado, em vez de aceitar e reclamar depois.
export function centavosDigitados(texto: string): number {
    const digitos = texto.replace(/\D/g, '').replace(/^0+/, '')
    if (digitos.length > DIGITOS_DO_PRECO_MAX) return centavosDigitados(digitos.slice(0, DIGITOS_DO_PRECO_MAX))
    return digitos ? parseInt(digitos, 10) : 0
}

export const produtoSchema = z.object({
    nome: z
        .string()
        .transform((v) => v.replace(/\s+/g, ' ').trim())
        .pipe(
            z
                .string()
                .min(2, 'Informe o nome do produto.')
                .max(NOME_PRODUTO_MAX, `Use no máximo ${NOME_PRODUTO_MAX} caracteres.`),
        ),
    descricao: z
        .string()
        .transform((v) => v.replace(/\s+/g, ' ').trim())
        .pipe(z.string().max(DESCRICAO_PRODUTO_MAX, `Use no máximo ${DESCRICAO_PRODUTO_MAX} caracteres.`))
        .transform((v) => (v === '' ? null : v)),
    categoria_id: z.uuid('Escolha a categoria do produto.'),
    preco: z
        .string()
        .transform((v) => centavosDoTexto(v))
        .pipe(
            z
                .number()
                .int()
                .min(1, 'Informe o preço do produto.')
                .max(PRECO_MAX_CENTAVOS, 'O preço máximo é R$ 9.999,99.'),
        ),
})

export type ProdutoCampos = keyof z.input<typeof produtoSchema>
