import { createPinia } from 'pinia'
// pinia 自动持久化插件
import persist from 'pinia-plugin-persistedstate'

// 1. 创建 pinia 实例
const pinia = createPinia()

// 2. 使用 pinia 插件
pinia.use(persist)

export default pinia

// 3. 下面两种暴露方式选其一
// import { useUserStore } from './user'
// export { useUserStore }

// export * from './modules/user'
// export * from './modules/consult'
