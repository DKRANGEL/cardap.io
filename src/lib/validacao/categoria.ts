import { z } from 'zod'

export const NOME_CATEGORIA_MAX = 40

export function normalizarNome(nome: string) {
    return nome
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
}

export function nomeJaExiste(nome: string, existentes: string[], ignorar?: string) {
    const alvo = normalizarNome(nome)
    const ignorado = ignorar === undefined ? null : normalizarNome(ignorar)
    return existentes.some((e) => {
        const n = normalizarNome(e)
        return n === alvo && n !== ignorado
    })
}

export const categoriaSchema = z.object({
    nome: z
        .string()
        .transform((v) => v.replace(/\s+/g, ' ').trim())
        .pipe(
            z
                .string()
                .min(2, 'Informe o nome da categoria.')
                .max(NOME_CATEGORIA_MAX, `Use no máximo ${NOME_CATEGORIA_MAX} caracteres.`),
        ),
})

export type CategoriaCampos = keyof z.input<typeof categoriaSchema>
