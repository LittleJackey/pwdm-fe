import type { BasePageQueryParam } from './data'

export type AccountPageQueryDTO = BasePageQueryParam & {
  /** 网站/服务名称 */
  website?: string

  /** 网站登录URL */
  url?: string

  /** 发布页 */
  officialAccessUrl?: string

  /** 用户名/邮箱/手机号 */
  username?: string

  /** 昵称 */
  nickname?: string

  /** 注册邮箱 */
  email?: string

  /** 第二邮箱 */
  secEmail?: string

  /** 注册手机号 */
  phone?: string

  /** 账号拥有者，例如姓名等 */
  owner?: string

  /** 备注信息 */
  notes?: string

  /** 二次验证服务商(如Google Auth等) */
  mfaProvider?: string

  /** 创建时间的起始时间 */
  createTimeStart?: string

  /** 创建时间的结束时间 */
  createTimeEnd?: string

  /** 修改时间的起始时间 */
  updateTimeStart?: string

  /** 修改时间的结束时间 */
  updateTimeEnd?: string
}

export type AccountVO = {
  /** 主键id */
  id: number

  /** 网站/服务名称 */
  website: string

  /** 网站登录URL */
  url: string

  /** 发布页 */
  officialAccessUrl: string

  /** 用户名/邮箱/手机号 */
  username: string

  /** 昵称 */
  nickname: string

  /** 账户密码(加密存储) */
  password: string

  /** 注册邮箱 */
  email: string

  /** 第二邮箱 */
  secEmail: string

  /** 注册手机号 */
  phone: string

  /** 账号拥有者，例如姓名等 */
  owner: string

  /** 备注信息 */
  notes: string

  /** 二次验证服务商(如Google Auth等) */
  mfaProvider: string

  /** 恢复代码(加密存储) */
  recoveryCodes: string

  /** 安全问题1(加密存储) */
  securityQuestion1: string

  /** 安全答案1(加密存储) */
  securityAnswer1: string

  /** 安全问题2(加密存储) */
  securityQuestion2: string

  /** 安全答案2(加密存储) */
  securityAnswer2: string

  /** 安全问题3(加密存储) */
  securityQuestion3: string

  /** 安全答案3(加密存储) */
  securityAnswer3: string

  /** 创建时间 */
  createTime: string

  /** 修改时间 */
  updateTime: string
}

export type AddAccountDTO = {
  /** 网站/服务名称 */
  website: string

  /** 网站登录URL */
  url: string

  /** 发布页 */
  officialAccessUrl?: string

  /** 用户名/邮箱/手机号 */
  username: string

  /** 昵称 */
  nickname?: string

  /** 账户密码(加密存储) */
  password: string

  /** 注册邮箱 */
  email?: string

  /** 第二邮箱 */
  secEmail?: string

  /** 注册手机号 */
  phone?: string

  /** 账号拥有者，例如姓名等 */
  owner?: string

  /** 备注信息 */
  notes: string

  /** 二次验证服务商(如Google Auth等) */
  mfaProvider?: string

  /** 恢复代码(加密存储) */
  recoveryCodes?: string

  /** 安全问题1(加密存储) */
  securityQuestion1?: string

  /** 安全答案1(加密存储) */
  securityAnswer1?: string

  /** 安全问题2(加密存储) */
  securityQuestion2?: string

  /** 安全答案2(加密存储) */
  securityAnswer2?: string

  /** 安全问题3(加密存储) */
  securityQuestion3?: string

  /** 安全答案3(加密存储) */
  securityAnswer3?: string

  /** rsa 签名,(原始数据为user.uid) */
  signature: string
}

export type UpdateAccountDTO = {
  /** 主键id */
  id: number

  /** 网站/服务名称 */
  website: string

  /** 网站登录URL */
  url: string

  /** 发布页 */
  officialAccessUrl?: string

  /** 用户名/邮箱/手机号 */
  username: string

  /** 昵称 */
  nickname?: string

  /** 账户密码(加密存储) */
  password: string

  /** 注册邮箱 */
  email?: string

  /** 第二邮箱 */
  secEmail?: string

  /** 注册手机号 */
  phone?: string

  /** 账号拥有者，例如姓名等 */
  owner?: string

  /** 备注信息 */
  notes: string

  /** 二次验证服务商(如Google Auth等) */
  mfaProvider?: string

  /** 恢复代码(加密存储) */
  recoveryCodes?: string

  /** 安全问题1(加密存储) */
  securityQuestion1?: string

  /** 安全答案1(加密存储) */
  securityAnswer1?: string

  /** 安全问题2(加密存储) */
  securityQuestion2?: string

  /** 安全答案2(加密存储) */
  securityAnswer2?: string

  /** 安全问题3(加密存储) */
  securityQuestion3?: string

  /** 安全答案3(加密存储) */
  securityAnswer3?: string

  /** rsa 签名,(原始数据为user.uid) */
  signature: string
}
