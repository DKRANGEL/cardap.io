import type { ModeloId } from '../modelos.ts'
import type { TemplateDoPdf } from '../tipos.ts'
import { classico } from './classico.ts'
import { compacto } from './compacto.ts'
import { destaque } from './destaque.ts'
import { vitrine } from './vitrine.ts'

export { TEMPLATE_PADRAO, temTemplate } from '../modelos.ts'

// Registro plugável: um novo modelo é uma linha aqui e uma em modelos.ts.
export const TEMPLATES: Record<ModeloId, TemplateDoPdf> = { classico, compacto, vitrine, destaque }
