// Lista leve dos modelos de PDF (sem importar os templates), usada também pela interface.
// `foto` é o lado da miniatura embutida em px; 0 = o modelo não mostra fotos e nem as baixa.
export const MODELOS = [
    { id: 'classico', nome: 'Clássico', foto: 180 },
    { id: 'compacto', nome: 'Compacto', foto: 0 },
    { id: 'vitrine', nome: 'Vitrine', foto: 320 },
    { id: 'destaque', nome: 'Destaque', foto: 0 },
] as const

export type ModeloId = (typeof MODELOS)[number]['id']

export const TEMPLATE_PADRAO: ModeloId = 'classico'

export const temTemplate = (id: string): id is ModeloId => MODELOS.some((m) => m.id === id)

export const ladoDaFoto = (id: ModeloId) => MODELOS.find((m) => m.id === id)?.foto ?? 0
