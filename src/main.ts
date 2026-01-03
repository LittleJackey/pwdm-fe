import { createApp } from 'vue'

import router from './router'
import pinia from './stores'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './styles/main.scss'
import App from './App.vue'

/**
 * 解决报错：Module "buffer" has been externalized for browser compatibility.
 * Cannot access "buffer.Buffer" in client code.
 * elliptic 内部用了 Node 的 Buffer，浏览器里没有
 */
import { Buffer } from 'buffer'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
globalThis.Buffer = Buffer

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})
// 全局注册 element-plus-icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
