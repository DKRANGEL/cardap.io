export type CorDerivada = { cor: string; contraste: string; tinta: string }

export const TEXTO_CLARO = '#fffdfa'
export const TEXTO_ESCURO = '#1c1814'
const FUNDO_PAPEL = '#fffdfa'
const CONTRASTE_MINIMO = 4.5

type Rgb = [number, number, number]

function hexParaRgb(hex: string): Rgb {
    const h = hex.replace('#', '')
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb
}

function rgbParaHex([r, g, b]: Rgb) {
    return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

const paraLinear = (c: number) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

const paraSrgb = (l: number) => {
    const v = l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055
    return Math.min(255, Math.max(0, v * 255))
}

export function luminanciaRelativa(hex: string) {
    const [r, g, b] = hexParaRgb(hex).map(paraLinear)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function razaoDeContraste(a: string, b: string) {
    const la = luminanciaRelativa(a)
    const lb = luminanciaRelativa(b)
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

function rgbParaOklab(rgb: Rgb): Rgb {
    const [r, g, b] = rgb.map(paraLinear)
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    return [
        0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    ]
}

function oklabParaRgb([L, a, b]: Rgb): Rgb {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
    return [
        paraSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
        paraSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
        paraSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    ]
}

function escurecer(hex: string, passo: number) {
    const [L, a, b] = rgbParaOklab(hexParaRgb(hex))
    return rgbParaHex(oklabParaRgb([Math.max(0, L - passo), a, b]))
}

export function normalizarHex(hex: string) {
    return hex.toLowerCase()
}

function melhorTexto(cor: string) {
    return razaoDeContraste(cor, TEXTO_CLARO) >= razaoDeContraste(cor, TEXTO_ESCURO) ? TEXTO_CLARO : TEXTO_ESCURO
}

export function derivarCorDaLoja(hexEntrada: string): CorDerivada {
    const original = normalizarHex(hexEntrada)

    // Em cores do miolo (cinza médio, alguns verdes) nenhum dos dois textos chega a 4,5:1.
    // Nesse caso o fundo do botão é ajustado até o melhor texto ficar legível.
    let cor = original
    for (let i = 0; i < 40 && razaoDeContraste(cor, melhorTexto(cor)) < CONTRASTE_MINIMO; i++) {
        cor = escurecer(cor, 0.01)
    }

    const contraste = melhorTexto(cor)

    let tinta = cor
    for (let i = 0; i < 40 && razaoDeContraste(tinta, FUNDO_PAPEL) < CONTRASTE_MINIMO; i++) {
        tinta = escurecer(tinta, 0.02)
    }

    return { cor, contraste, tinta }
}
