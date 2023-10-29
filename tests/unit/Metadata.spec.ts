import { createApp,h } from 'vue'
import { test, expect} from 'vitest'
import { useMetadata } from '../../src/index'

test('toFormValues', () => {
    const { toFormValues } = useMetadata()
    const a = { a: "foo", b: 1, c:null }
    const b = toFormValues(a)

    // toFormValues mutates and returns original argument
    expect(a === b).true
    expect(a.a).eq('foo')
    expect(a.b).eq(1)
    expect(a.c).eq(null)
})
