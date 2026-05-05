import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/modules/user'
import { getKdfConfigAndVerificationApi } from '@/services/keystore'

NProgress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login/index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register/index.vue'),
      meta: { title: '注册' }
    },
    {
      path: '/setup',
      name: 'Setup',
      component: () => import('@/views/Setup/index.vue'),
      meta: { title: '初始化密码库', requiresAuth: true }
    },
    {
      path: '/user-info',
      name: 'UserInfo',
      component: () => import('@/views/UserInfo/index.vue'),
      meta: { title: '个人中心', requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/home',
      component: () => import('@/views/Layout/index.vue'),
      children: [
        {
          path: '/home',
          name: 'Home',
          component: () => import('@/views/Home/index.vue'),
          meta: { title: '首页', requiresAuth: true }
        },
        {
          path: '/pwdm',
          name: 'PWDM',
          component: () => import('@/views/Pwdm/index.vue'),
          meta: { title: '密码管理', requiresAuth: true }
        },
        {
          path: '/admin/invite',
          name: 'AdminInvite',
          component: () => import('@/views/Admin/Invite/index.vue'),
          meta: { title: '邀请码管理', requiresAuth: true, role: 'admin' }
        }
      ]
    }
  ]
})

let keystoreStatusChecked = false
let hasKeystore = false

router.beforeEach(async (to) => {
  NProgress.start()
  const userStore = useUserStore()

  const publicRoutes = ['/login', '/register']
  if (!userStore.user && !publicRoutes.includes(to.path)) {
    return '/login'
  }

  if (userStore.user) {
    // Role check for admin routes
    if (to.meta.role && userStore.user.role !== to.meta.role) {
      return '/home'
    }

    // Keystore check (only once, skip on setup page itself)
    if (!keystoreStatusChecked && to.path !== '/setup') {
      try {
        const res = await getKdfConfigAndVerificationApi()
        hasKeystore = res.data.exists === true
        keystoreStatusChecked = true
      } catch {
        hasKeystore = false
        keystoreStatusChecked = true
      }
    }

    // Redirect to setup if no keystore
    if (!hasKeystore && !['/setup', '/logout'].includes(to.path)) {
      return '/setup'
    }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title || ''}-pwdm`
  NProgress.done()
})

export default router
