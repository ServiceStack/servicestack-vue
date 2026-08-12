import { createApp, h } from 'vue'
import { nextTick } from 'vue'
import { test, expect } from 'vitest'
import JsonSchemaForm from '../../src/components/schema/JsonSchemaForm.vue'
import ApiFormSchema from '../../src/components/schema/ApiFormSchema.vue'

test('does not prefix absolute request URLs in cURL previews', () => {
    const container = document.createElement('div')
    let curl = ''
    const app = createApp({
        render: () => h(ApiFormSchema, {
            schema: {
                $id: 'https://blazor-gallery.servicestack.net/api/Hello',
                method: 'GET',
                properties: { Name: { type: 'string' } },
            },
            modelValue: { Name: 'Vue' },
        }, {
            default: value => {
                curl = value.curl
                return h('pre', value.curl)
            },
        }),
    })

    app.mount(container)

    expect(curl).toContain("'https://blazor-gallery.servicestack.net/api/Hello?Name=Vue'")
    expect(curl).not.toContain(`${location.origin}https://`)
    app.unmount()
})

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

test('adds an item on the first click when an array is initially absent', async () => {
    const container = document.createElement('div')
    const changes = []
    const schema = {
        type: 'array',
        title: 'Final order items',
        items: {
            type: 'object',
            properties: { productId: { type: 'integer' } },
        },
    }
    const app = createApp({
        render: () => h(JsonSchemaForm, {
            schema,
            onChange: value => changes.push(value),
        }),
    })

    app.mount(container)
    const add = [...container.querySelectorAll('button')].find(x => x.textContent.trim() === '+ Add')
    add.click()
    await nextTick()

    expect(changes).toHaveLength(1)
    expect(changes[0]).toEqual([{ productId: 0 }])
    expect(container.textContent).toContain('1')

    app.unmount()
})
