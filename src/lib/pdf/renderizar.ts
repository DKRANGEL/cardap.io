import type { Browser } from 'puppeteer-core'

const CAMINHOS_LOCAIS = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

const ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']

let navegador: Promise<Browser> | null = null

async function abrir(): Promise<Browser> {
    const puppeteer = (await import('puppeteer-core')).default

    const local = process.env.CHROME_PATH
    if (local) return puppeteer.launch({ executablePath: local, args: ARGS, headless: true })

    if (process.env.NODE_ENV !== 'production') {
        const { existsSync } = await import('node:fs')
        const achado = CAMINHOS_LOCAIS.find((c) => existsSync(c))
        if (achado) return puppeteer.launch({ executablePath: achado, args: ARGS, headless: true })
    }

    const chromium = (await import('@sparticuz/chromium')).default
    return puppeteer.launch({
        executablePath: await chromium.executablePath(),
        args: [...chromium.args, ...ARGS],
        headless: true,
    })
}

// Uma instância reaproveitada entre requisições (o primeiro uso aquece; os seguintes são rápidos).
async function obterNavegador() {
    if (navegador) {
        const atual = await navegador
        if (atual.connected) return atual
        navegador = null
    }
    navegador = abrir().catch((erro) => {
        navegador = null
        throw erro
    })
    return navegador
}

export async function renderizarPdf(html: string): Promise<Buffer> {
    const browser = await obterNavegador()
    const pagina = await browser.newPage()
    try {
        await pagina.setContent(html, { waitUntil: 'load', timeout: 15_000 })
        await pagina.emulateMediaType('print')
        await Promise.race([pagina.evaluate(() => document.fonts.ready), new Promise((r) => setTimeout(r, 2000))])
        const pdf = await pagina.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        })
        return Buffer.from(pdf)
    } finally {
        await pagina.close().catch(() => {})
    }
}

export function nomeDoArquivo(slug: string) {
    const limpo = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60)
    return `cardapio-${limpo || 'loja'}.pdf`
}
