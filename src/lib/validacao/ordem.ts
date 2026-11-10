import { z } from 'zod'

export const ordemSchema = z
    .array(z.uuid())
    .min(1)
    .max(200)
    .refine((ids) => new Set(ids).size === ids.length, 'Ids repetidos.')
