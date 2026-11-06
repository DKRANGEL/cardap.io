import { z } from 'zod'
import { DESCRICAO_PRODUTO_MAX, NOME_PRODUTO_MAX } from '../limites-produto.ts'
import { centavosDoTexto, PRECO_MAX_CENTAVOS } from '../preco.ts'

export { DESCRICAO_PRODUTO_MAX, NOME_PRODUTO_MAX }

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
