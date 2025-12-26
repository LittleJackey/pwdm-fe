import type { User } from '@/types/user'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'pwdm-user',
  () => {
    // 1. 用户状态信息
    const user = ref<User>()

    // 2. 设置用户信息的函数
    const setUser = (u: User) => {
      user.value = u
    }

    // 3. 删除用户信息的函数
    const delUser = () => {
      user.value = undefined
    }

    return { user, setUser, delUser }
  },
  {
    // 开启自动持久化
    persist: true
  }
)
