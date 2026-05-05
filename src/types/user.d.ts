export type User = {
  /* 对外用户标识 */
  uid: string

  /* 用户名 */
  username: string

  /* 角色: admin 或 user */
  role: string

  /* 创建时间 */
  createTime: Date
}

export type LoginDTO = {
  username: string
  password: string
  captchaUuid: string
  captchaCode: string
}

export type RegisterDTO = {
  inviteCode: string
  username: string
  password: string
}

export type UserUpdateDTO = {
  uid?: string
  username: string
  password: string
}
