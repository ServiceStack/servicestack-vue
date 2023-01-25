import { createApp } from 'vue'
import { createRouter, createWebHistory } from "vue-router"
import './tailwind.css'
import App from './demo/App.vue'
import ServiceStackVue from '.'

const colorScheme = localStorage.getItem('color-scheme')
if (colorScheme === 'dark') {
    document.querySelector('html')?.classList.add('dark')
} else {
    document.querySelector('html')?.classList.remove('dark')
}

const router = createRouter({
    history: createWebHistory(),
    routes: [],
})

createApp(App)
    .use(ServiceStackVue)
    .use(router)
    .mount('#app')
