export const SENHA_MIN = 8
export const SENHA_MAX = 72

const EMAIL_COMPLETO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const normalizarEmail = (valor: string) => valor.trim().toLowerCase()

export function erroDoEmail(valor: string): string | null {
    const email = valor.trim()
    if (!email) return 'Digite o e-mail.'
    if (!EMAIL_COMPLETO.test(email)) return 'Esse e-mail parece incompleto. Confira se tem @ e o final, como .com.'
    return null
}

export function erroDaSenha(valor: string): string | null {
    if (!valor) return 'Digite a senha.'
    if (valor.length < SENHA_MIN) return `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`
    if (valor.length > SENHA_MAX) return `A senha pode ter no máximo ${SENHA_MAX} caracteres.`
    return null
}
