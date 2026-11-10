import assert from 'node:assert/strict'
import { test } from 'node:test'
import { moverItem } from './reordenar.ts'

test('move para baixo e para cima', () => {
    assert.deepEqual(moverItem(['a', 'b', 'c'], 0, 2), ['b', 'c', 'a'])
    assert.deepEqual(moverItem(['a', 'b', 'c'], 2, 0), ['c', 'a', 'b'])
    assert.deepEqual(moverItem(['a', 'b', 'c'], 1, 0), ['b', 'a', 'c'])
})

test('limites e posições inválidas não quebram nem mexem na lista', () => {
    assert.deepEqual(moverItem(['a', 'b'], 0, 9), ['b', 'a'])
    assert.deepEqual(moverItem(['a', 'b'], 1, -3), ['b', 'a'])
    assert.deepEqual(moverItem(['a', 'b'], 5, 0), ['a', 'b'])
    assert.deepEqual(moverItem(['a', 'b'], 1, 1), ['a', 'b'])
})

test('não altera a lista original', () => {
    const l = ['a', 'b', 'c']
    moverItem(l, 0, 2)
    assert.deepEqual(l, ['a', 'b', 'c'])
})
