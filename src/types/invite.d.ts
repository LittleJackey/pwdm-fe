export type GenerateInviteDTO = {
  expiresTime?: string
}

export type InviteCodeVO = {
  id: number
  code: string
  createdBy: number
  usedBy: number | null
  usedByUsername: string | null
  usedByUid: string | null
  usedTime: string | null
  expiresTime: string | null
  status: number // 0=未使用 1=已使用 2=已过期
  createTime: string
}
