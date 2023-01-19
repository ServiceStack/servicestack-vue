import { createApp } from 'vue'
import { createRouter, createWebHistory } from "vue-router"
import './tailwind.css'
import App from './demo/App.vue'
import VueTw from '.'

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
    .use(VueTw)
    .use(router)
    .mount('#app')
