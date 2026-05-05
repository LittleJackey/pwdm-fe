import type { CaptchaImg } from '@/types/data'
import type { RegisterDTO, UserUpdateDTO, LoginDTO, User } from '@/types/user'
import { request } from '@/utils/request'

export const loginByPasswordApi = (loginDto: LoginDTO) => {
  return request<User>('auth/login/password', 'POST', loginDto)
}

export const getUserInfoApi = () => request<User>('user', 'GET')

export const logoutApi = () => request('auth/logout', 'GET')

export const getCaptchaImgApi = () => request<CaptchaImg>('auth/captcha-img', 'GET')

export const registerApi = (registerDto: RegisterDTO) => {
  return request<User>('auth/register', 'POST', registerDto)
}

export const updateMyProfileApi = (userUpdateDto: UserUpdateDTO) => request('user/me', 'PUT', userUpdateDto)
