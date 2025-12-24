import type { User } from '@/types/user'
import { eccEncrypt } from '@/utils/ecc'
import { request } from '@/utils/request'

export const loginByPassword = (username: string, password: string) =>
  request<User>('login/password', 'POST', { username, password })

export const encodePassword = (password: string) => {
  return eccEncrypt(password)
}

export const isLogin = () => request<User>('acc/isLogin', 'GET')
