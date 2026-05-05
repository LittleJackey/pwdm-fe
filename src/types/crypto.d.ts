export type KeystoreSetupDTO = {
  salt: string
  kdfAlgo: string
  kdfParams: string
  verifyIv: string
  verifyCiphertext: string
}

export type UserKeystoreVO = {
  exists: boolean
  salt?: string
  kdfParams?: string
  verifyIv?: string
  verifyCiphertext?: string
}

/** 用户加密配置（需持久化保存到后端或本地，全局唯一） */
export type KdfConfig = {
  /** Argon2 盐值 (Base64) */
  salt: string
  /** Argon2 迭代次数 */
  iterations: number
  /** Argon2 内存消耗 (KB) */
  memory: number
  /** Argon2 并行度 */
  parallelism: number
}

/** 单条记录加密后的结果（对应数据库中存储的密文结构） */
export type EncryptedRecord = {
  /** AES-GCM 初始向量 (Base64) - 每次加密随机生成，必须保存 */
  iv: string
  /** 加密后的密文 (Base64) */
  ciphertext: string
}

/** Pinia 中缓存的解锁状态 */
export type VaultState = {
  /** 是否已解锁 */
  isUnlocked: boolean
  /** 派生出的 AES 主密钥 (CryptoKey 对象，仅在内存中存在) */
  masterKey: CryptoKey | null
  /** 当前的 KDF 配置 */
  kdfConfig: KdfConfig | null
  verifyIv: string | null
  verifyCiphertext: string | null
}
