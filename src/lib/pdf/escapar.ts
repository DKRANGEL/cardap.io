const MAPA: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

// Todo texto vindo do lojista passa por aqui antes de entrar no HTML que o Chromium vai renderizar.
export const escapar = (texto: string) => texto.replace(/[&<>"']/g, (c) => MAPA[c])
