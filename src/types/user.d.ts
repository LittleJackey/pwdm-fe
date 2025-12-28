export type User = {
  /* 对外用户标识 */
  uid: string

  /* 用户名 */
  username: string

  /* RSA公钥 */
  rsaPublicKey: string

  /* 角色: admin 或 user */
  role: string

  /* 是否已经生成rsa秘钥: 0-未生成, 1-已生成 */
  isRsaGenerated: boolean

  /* 创建时间 */
  createTime: Date
}

export type LoginDTO = {
  username: string
  password: string
  captchaUuid: string
  captchaCode: string
}

export type UserUpdateDTO = {
  uid?: string
  username: string
  password: string
}

export type RsaKeyPairPemVO = {
  uuid: string
  publicKeyPemContent: string
  privateKeyPemContent: string
}
