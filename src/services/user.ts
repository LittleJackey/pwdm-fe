import type { CaptchaImg } from '@/types/data'
import type { UserUpdateDTO, LoginDTO, User, RsaKeyPairPemVO } from '@/types/user'
import { eccEncrypt } from '@/utils/ecc'
import { request } from '@/utils/request'

export const loginByPasswordApi = (loginDto: LoginDTO) => {
  return request<User>('auth/login/password', 'POST', loginDto)
}

export const encodePassword = (password: string) => {
  return eccEncrypt(password)
}

export const logoutApi = () => request('auth/logout', 'GET')

export const getCaptchaImgApi = () => request<CaptchaImg>('auth/captcha-img', 'GET')

export const updateMyProfileApi = (userUpdateDto: UserUpdateDTO) => request('user/me', 'PUT', userUpdateDto)

export const getRsaKeyPairPemApi = () =>
  request<RsaKeyPairPemVO>('user/rsa-key-pair-pem', 'GET', {}, { timeout: 30000 })

export const storeRsaPublicKeyApi = (uuid: string) => request('/user/store-rsa-public-key', 'GET', { uuid })
