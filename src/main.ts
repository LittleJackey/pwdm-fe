import { createApp } from 'vue'

import router from './router'
import pinia from './stores'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './styles/main.scss'
import App from './App.vue'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus)
// 全局注册 element-plus-icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
