import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ordemSchema } from './ordem.ts'

const A = '3f2b8c1e-5a4d-4e7b-9c6a-1d2e3f4a5b6c'
const B = '4f2b8c1e-5a4d-4e7b-9c6a-1d2e3f4a5b6c'

test('aceita lista de ids distintos', () => assert.equal(ordemSchema.safeParse([A, B]).success, true))

test('recusa vazio, repetido, lixo e não-lista', () => {
    for (const v of [[], [A, A], ['x'], 'abc', null, [A, 1]]) assert.equal(ordemSchema.safeParse(v).success, false, JSON.stringify(v))
})
