// Argon2Api.ts

import { argon2id } from 'hash-wasm'
import { bufToBase64, base64ToBuf, generateRandomBytes } from './helper'
import type { KdfConfig, EncryptedRecord } from '@/types/crypto'

export class Argon2Api {
  /** 默认的 Argon2id 安全参数 */
  static readonly DEFAULT_KDF_CONFIG: Omit<KdfConfig, 'salt'> = {
    iterations: 3, // 迭代次数
    memory: 65536, // 内存 64MB
    parallelism: 2 // 并行线程
  }
  /**
   * 初始化密码库 (仅首次使用时调用)
   */
  static initKdfConfig(): KdfConfig {
    return {
      salt: generateRandomBytes(16),
      ...this.DEFAULT_KDF_CONFIG
    }
  }

  /**
   * 生成密钥文件的内容
   * 生成 64 字节 (512位) 的高强度随机字符串作为文件内容
   */
  static generateKeyFileContent(): string {
    return generateRandomBytes(64)
  }

  /**
   * 解锁密码库：PIN + 密钥文件 派生主密钥
   *
   * @param pin 用户输入的短密码 (PIN)
   * @param keyFileContent 从 .pmk 文件读取出的文本内容
   * @param kdfConfig 存储在服务端的 KDF 配置和盐值
   * @returns CryptoKey 主密钥
   */
  static async deriveMasterKey(pin: string, keyFileContent: string, kdfConfig: KdfConfig): Promise<CryptoKey> {
    try {
      // 将 Base64 的 salt 转换为 Uint8Array
      const saltUint8 = new Uint8Array(base64ToBuf(kdfConfig.salt))

      // 核心逻辑：拼接 PIN 和 密钥文件内容
      // 即使 PIN 很短，加上 512 位的随机文件内容后，整体熵极高，完全抵抗暴力破解
      const combinedPassword = pin + keyFileContent

      // 使用 hash-wasm 执行 Argon2id 派生
      const derivedKey = await argon2id({
        password: combinedPassword,
        salt: saltUint8,
        parallelism: kdfConfig.parallelism,
        iterations: kdfConfig.iterations,
        memorySize: kdfConfig.memory, // 单位是 KB
        hashLength: 32, // 32 bytes = 256 bits (AES-256)
        outputType: 'binary' // 直接输出 Uint8Array，省去 hex 转换
      })

      // 将派生出的密钥导入 Web Crypto API 成为原生的 CryptoKey
      const masterKey = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(derivedKey), // 使用 new Uint8Array() 包裹，解决 TS 类型报错
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      )

      return masterKey
    } catch (error) {
      console.error('Argon2 密钥派生失败:', error)
      throw new Error('密钥派生失败，请检查 KDF 参数')
    }
  }

  /**
   * 3. 加密单条记录
   */
  static async encryptRecord(plaintext: string, masterKey: CryptoKey): Promise<EncryptedRecord> {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encodedPlaintext = new TextEncoder().encode(plaintext)
    const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, masterKey, encodedPlaintext)
    return {
      iv: bufToBase64(iv.buffer),
      ciphertext: bufToBase64(encryptedBuffer)
    }
  }
  /**
   * 4. 解密单条记录
   */
  static async decryptRecord(encryptedRecord: EncryptedRecord, masterKey: CryptoKey): Promise<string> {
    try {
      const iv = base64ToBuf(encryptedRecord.iv)
      const ciphertext = base64ToBuf(encryptedRecord.ciphertext)
      const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, masterKey, ciphertext)
      return new TextDecoder().decode(decryptedBuffer)
    } catch (error) {
      console.error('解密失败:', error)
      throw new Error('解密失败，主密码可能错误或数据已损坏')
    }
  }
}
