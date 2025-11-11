import { createApp, h } from 'vue'
import { test, expect } from 'vitest'
import { useMetadata } from '../../src/index'

test('toFormValues', () => {
    let result: any

    // Create a Vue app to provide the proper context for the composable
    const app = createApp({
        setup() {
            const { toFormValues } = useMetadata()
            const a = { a: "foo", b: 1, c: null }
            const b = toFormValues(a)

            result = { a, b }
            return {}
        },
        render: () => h('div')
    })

    const container = document.createElement('div')
    app.mount(container)

    // toFormValues mutates and returns original argument
    expect(result.a === result.b).toBe(true)
    expect(result.a.a).toBe('foo')
    expect(result.a.b).toBe(1)
    expect(result.a.c).toBe(null)
})
