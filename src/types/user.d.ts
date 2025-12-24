export type User = {
  /* 对外用户标识 */
  uid: string

  /* 用户名 */
  username: string

  /* RSA公钥 */
  rsaPublicKey: string

  /* 角色: admin 或 user */
  role: string
}
