import { createApp } from 'vue'
import { createRouter, createWebHistory } from "vue-router"
import './tailwind.css'
import App from './demo/App.vue'
import VueTw from '.'

const router = createRouter({
    history: createWebHistory(),
    routes: [],
})

createApp(App)
    .use(VueTw)
    .use(router)
    .mount('#app')
