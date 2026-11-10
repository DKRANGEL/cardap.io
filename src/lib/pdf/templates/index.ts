import type { TemplateDoPdf } from '../tipos.ts'
import { provisorio } from './provisorio.ts'

// Registro plugável: um novo modelo é só mais uma linha aqui.
export const TEMPLATES: Record<string, TemplateDoPdf> = { provisorio }

export const TEMPLATE_PADRAO = 'provisorio'

export const temTemplate = (id: string) => Object.hasOwn(TEMPLATES, id)
