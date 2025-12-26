import type { CaptchaImg } from '@/types/data'
import type { LoginDto, User } from '@/types/user'
import { eccEncrypt } from '@/utils/ecc'
import { request } from '@/utils/request'

export const loginByPassword = (loginDto: LoginDto) => {
  return request<User>('auth/login/password', 'POST', loginDto)
}

export const encodePassword = (password: string) => {
  return eccEncrypt(password)
}

export const logout = () => request('auth/logout', 'GET')

export const getCaptchaImgApi = () => request<CaptchaImg>('auth/captcha-img', 'GET')
