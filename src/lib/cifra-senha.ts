import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const VERSAO = 'v1'

function chave(base64 = process.env.SENHAS_CHAVE): Buffer {
    if (!base64) throw new Error('SENHAS_CHAVE não está definida.')
    const bytes = Buffer.from(base64, 'base64')
    if (bytes.length !== 32) throw new Error('SENHAS_CHAVE precisa ter 32 bytes em base64.')
    return bytes
}

export function cifrar(senha: string, chaveBase64?: string): string {
    const iv = randomBytes(12)
    const cifra = createCipheriv('aes-256-gcm', chave(chaveBase64), iv)
    const texto = Buffer.concat([cifra.update(senha, 'utf8'), cifra.final()])
    return [VERSAO, iv, cifra.getAuthTag(), texto].map((p) => (typeof p === 'string' ? p : p.toString('base64url'))).join('.')
}

export function decifrar(valor: string, chaveBase64?: string): string {
    const [versao, iv, tag, texto] = valor.split('.')
    if (versao !== VERSAO || !iv || !tag || !texto) throw new Error('Formato de senha cifrada inválido.')
    const decifra = createDecipheriv('aes-256-gcm', chave(chaveBase64), Buffer.from(iv, 'base64url'))
    decifra.setAuthTag(Buffer.from(tag, 'base64url'))
    return Buffer.concat([decifra.update(Buffer.from(texto, 'base64url')), decifra.final()]).toString('utf8')
}
