export const PRECO_MAX_CENTAVOS = 999_999

const DIGITOS_DO_PRECO_MAX = String(PRECO_MAX_CENTAVOS).length

// Funções puras de preço, sem dependências, para o campo do navegador não carregar o zod junto.

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
