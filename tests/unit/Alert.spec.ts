import { createApp,h } from 'vue';
import {test,expect} from 'vitest'
import Alert from '../../src/components/Alert.vue';

test('displays the alert message in the slot', async () => {
    // Create a mount point
    const container = document.createElement('div');

    // Create a Vue app and mount it
    const app = createApp({
        render: () => h(Alert, { type: 'warn' }, 'Hello, world!')
    });
    app.mount(container);

    // Test the rendered output
    expect(container.textContent).toContain('Hello, world!');
});

test('displays the correct classes for "warn" type', async () => {
    // Create a mount point
    const container = document.createElement('div');

    // Create a Vue app and mount it
    const app = createApp(Alert, { type: 'warn' });
    app.mount(container);

    // Test the rendered output
    const alertElement = container.firstChild as HTMLElement;
    const classes = alertElement.classList;

    expect(classes.contains('border-yellow-400')).toBe(true);
    expect(classes.contains('bg-yellow-50')).toBe(true);
});