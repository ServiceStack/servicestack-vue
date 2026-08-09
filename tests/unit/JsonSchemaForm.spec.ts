import { createApp, h } from 'vue'
import { test, expect } from 'vitest'
import JsonSchemaForm from '../../src/components/schema/JsonSchemaForm.vue'

test('renders explicit input types for string fields', () => {
    const container = document.createElement('div')
    const schema = {
        type: 'object',
        properties: {
            name: { type: 'string' },
            date: { type: 'string', format: 'date' },
        },
    }
    const app = createApp({
        render: () => h(JsonSchemaForm, {
            schema,
            data: { name: 'Acme', date: '2026-08-03' },
        }),
    })

    app.mount(container)

    const inputs = [...container.querySelectorAll('input')]
    expect(inputs.map(x => x.getAttribute('type'))).toEqual(['text', 'date'])

    app.unmount()
})
