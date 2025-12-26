export type User = {
  /* 对外用户标识 */
  uid: string

  /* 用户名 */
  username: string

  /* RSA公钥 */
  rsaPublicKey: string

  /* 角色: admin 或 user */
  role: string

  /* 创建时间 */
  createTime: Date
}

export type LoginDto = {
  username: string
  password: string
  captchaUuid: string
  captchaCode: string
}
