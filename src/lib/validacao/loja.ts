import { z } from 'zod'

export const SLUGS_RESERVADOS = ['painel', 'api', 'login', 'admin', '_next']

export function slugify(texto: string) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40)
}

export function normalizarWhatsapp(valor: string): string | null {
    let digitos = valor.replace(/\D/g, '')
    if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) {
        digitos = digitos.slice(2)
    }
    if (digitos.length !== 10 && digitos.length !== 11) return null
    return `+55${digitos}`
}

export function mascararWhatsapp(valor: string) {
    const d = valor.replace(/\D/g, '').slice(0, 11)
    if (d.length === 0) return ''
    if (d.length <= 2) return `(${d}`
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function whatsappParaExibicao(e164: string) {
    return mascararWhatsapp(e164.startsWith('+55') ? e164.slice(3) : e164)
}

export const lojaSchema = z.object({
    nome: z.string().trim().min(2, 'Informe o nome da loja.').max(80, 'Use no máximo 80 caracteres.'),
    slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, 'O endereço precisa ter pelo menos 3 caracteres.')
        .max(40, 'Use no máximo 40 caracteres.')
        .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use só letras minúsculas, números e hífen, sem começar ou terminar com hífen.')
        .refine((s) => !SLUGS_RESERVADOS.includes(s), 'Esse endereço é reservado. Escolha outro.'),
    whatsapp: z
        .string()
        .refine((v) => normalizarWhatsapp(v) !== null, 'Informe o WhatsApp com DDD, por exemplo (11) 91234-5678.')
        .transform((v) => normalizarWhatsapp(v)!),
    cor_primaria: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Escolha uma cor válida.'),
})

export type LojaCampos = keyof z.input<typeof lojaSchema>
