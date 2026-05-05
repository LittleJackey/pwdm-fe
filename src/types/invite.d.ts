export type GenerateInviteDTO = {
  expiresAt?: string
}

export type InviteCodeVO = {
  id: number
  code: string
  createdBy: number
  usedBy: number | null
  usedAt: string | null
  expiresAt: string | null
  status: number // 0=未使用 1=已使用 2=已过期
  createTime: string
}
