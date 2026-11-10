import { derivarCorDaLoja } from './cor-da-loja.ts'

// HeroUI espera "H S% L%" (sem hsl()) nas variáveis --heroui-*.
export function hexParaHslHeroui(hex: string): string {
    const h = hex.replace('#', '')
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    const d = max - min
    let matiz = 0
    let s = 0
    if (d !== 0) {
        s = d / (1 - Math.abs(2 * l - 1))
        if (max === r) matiz = ((g - b) / d) % 6
        else if (max === g) matiz = (b - r) / d + 2
        else matiz = (r - g) / d + 4
        matiz *= 60
        if (matiz < 0) matiz += 360
    }
    return `${(Math.round(matiz * 10) / 10)} ${Math.round(s * 1000) / 10}% ${Math.round(l * 1000) / 10}%`
}

// Variáveis que repintam o painel do lojista com a cor da loja (tokens "acao" do Tailwind e o primary do HeroUI).
export function temaDoPainel(corPrimaria: string): Record<string, string> {
    const { cor, contraste, tinta } = derivarCorDaLoja(corPrimaria)
    return {
        '--color-acao': cor,
        '--color-acao-texto': tinta,
        '--color-acao-hover': `color-mix(in srgb, ${cor} 85%, #000)`,
        '--color-acao-suave': `color-mix(in srgb, ${cor} 10%, #fff)`,
        '--color-acao-contraste': contraste,
        '--heroui-primary': hexParaHslHeroui(cor),
        '--heroui-primary-foreground': hexParaHslHeroui(contraste),
    }
}
