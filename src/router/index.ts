import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/modules/user'

/* showSpinner: false 关闭的是 NProgress 在进度条右侧那个小转圈动画（spinner）。
默认效果（true）
├------------------- 进度条 -------------------┤  ⟳ ← 这个小圆圈
设为 false 后就只剩一条细线，更干净。
 */
NProgress.configure({
  showSpinner: false
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/Login/index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/user-info',
      component: () => import('@/views/UserInfo/index.vue'),
      meta: { title: '个人中心' }
    },
    {
      path: '/',
      redirect: '/home',
      component: () => import('@/views/Layout/index.vue'),
      children: [
        {
          path: '/home',
          component: () => import('@/views/Home/index.vue'),
          meta: { title: '首页' }
        },
        {
          path: '/pwdm',
          component: () => import('@/views/Pwdm/index.vue'),
          meta: { title: '密码管理' }
        }
      ]
    }
  ]
})

// 全局的前置路由守卫
router.beforeEach((to) => {
  NProgress.start()
  const store = useUserStore()
  // 白名单
  const whiteList = ['/login']

  if (!store.user && !whiteList.includes(to.path)) {
    return '/login'
  }
  // 返回 false: 取消
  // 返回 true | undefined: 放行
  // 返回 路由地址(对象格式): 重定向
})

// 全局的后置路由守卫
router.afterEach((to) => {
  document.title = `${to.meta.title || ''}-pwdm`
  NProgress.done()
})

export default router
