import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { Argon2Api } from '@/crypto/argon2Api'
import type { KdfConfig, EncryptedRecord, VaultState } from '@/types/crypto'
import { getKdfConfigAndVerificationApi } from '@/services/keystore'

export const useVaultStore = defineStore('vault', () => {
  const vaultState = ref<VaultState>({
    isUnlocked: false,
    masterKey: <CryptoKey | null>null,
    kdfConfig: <KdfConfig | null>null,
    verifyIv: null,
    verifyCiphertext: null
  })
  // const isUnlocked = ref(false)
  // const masterKey = ref<CryptoKey | null>(null)
  // const kdfConfig = ref<KdfConfig | null>(null)

  /**
   * 首次设置：生成并下载密钥文件，初始化配置
   * @param pin 用户设置的短 PIN 码
   */
  const setupVaultWithKeyFile = async (pin: string) => {
    // 1. 生成密钥文件内容
    const fileContent = Argon2Api.generateKeyFileContent()
    console.log(1)

    // 2. 触发浏览器下载 .pmk 文件
    const blob = new Blob([fileContent], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vault_key_${Date.now()}.pmk` // 文件名建议带上时间戳
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    console.log(2)

    // 3. 初始化 KDF 配置
    const config = Argon2Api.initKdfConfig()

    // 4. 派生主密钥 (刚刚生成的文件内容还在变量里，直接用)
    const key = await Argon2Api.deriveMasterKey(pin, fileContent, config)

    console.log('kdfConfig = ', config)

    // 5. 保存状态 (实际应用中，config 需要上传到后端保存)
    vaultState.value.masterKey = key
    vaultState.value.kdfConfig = config
    vaultState.value.isUnlocked = true

    // 6. 生成验证记录（加密已知字符串，用于后续验证主密码）
    const verifyRecord = await Argon2Api.encryptRecord('pwdm-verify', key)
    vaultState.value.verifyIv = verifyRecord.iv
    vaultState.value.verifyCiphertext = verifyRecord.ciphertext

    // 提示用户务必保管好下载的文件
    alert('密钥文件已下载！请务必妥善保管，丢失将无法恢复密码！')
  }

  /**
   * 从后端获取 KDF 配置和主密码验证信息
   * 实际开发中替换为你的 API 请求
   */
  const fetchKdfConfigAndVerificationFromServer = async (): Promise<{
    kdfConfig: KdfConfig | null
    verifyRecord: EncryptedRecord | null
  }> => {
    const res = await getKdfConfigAndVerificationApi()
    if (!res.data.exists) {
      return { kdfConfig: null, verifyRecord: null }
    }

    const kdfParams = JSON.parse(res.data.kdfParams!)
    const kdfConfig = <KdfConfig>{
      salt: res.data.salt!,
      memory: kdfParams.memory,
      iterations: kdfParams.iterations,
      parallelism: kdfParams.parallelism
    }

    const verifyRecord = <EncryptedRecord>{
      iv: res.data.verifyIv!,
      ciphertext: res.data.verifyCiphertext!
    }

    return { kdfConfig, verifyRecord }
  }

  /**
   * 日常解锁：需要 PIN 和 文件对象
   * @param pin 用户输入的 PIN
   * @param file 用户上传的 .pmk 文件对象
   */
  async function unlock(pin: string, file: File) {
    // 1. 读取文件内容
    const fileContent = await readFileContent(file)

    // 2. 从后端获取 KDF 配置和主密钥验证信息
    const { kdfConfig, verifyRecord } = await fetchKdfConfigAndVerificationFromServer()

    if (!kdfConfig || !verifyRecord) {
      throw new Error('密码库未初始化，请先完成设置')
    }

    // 3. 派生主密钥
    const key = await Argon2Api.deriveMasterKey(pin, fileContent, kdfConfig)

    // 4. 验证主密钥
    try {
      await Argon2Api.decryptRecord(verifyRecord, key)
    } catch {
      throw new Error('解锁失败, PIN或秘钥文件不正确')
    }

    // 5. 解锁成功，缓存密钥到内存
    vaultState.value.masterKey = key
    vaultState.value.kdfConfig = kdfConfig
    vaultState.value.isUnlocked = true
  }

  /**
   * 辅助函数：读取文件文本内容
   */
  function readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      // 按文本读取，因为生成时存的就是 Base64 文本
      reader.readAsText(file)
    })
  }

  /**
   * 锁定密码库 (退出或超时)
   */
  function lock() {
    vaultState.value.masterKey = null
    vaultState.value.isUnlocked = false
    // 此时内存中的 CryptoKey 被清空，密文无法再被解密
  }

  /**
   * 保存新记录
   */
  async function saveRecord(plaintext: string): Promise<EncryptedRecord> {
    if (!vaultState.value.masterKey) throw new Error('密码库未解锁')
    // 调用加密 API
    return Argon2Api.encryptRecord(plaintext, vaultState.value.masterKey)
  }

  /**
   * 读取记录
   */
  async function readRecord(encrypted: EncryptedRecord): Promise<string> {
    if (!vaultState.value.masterKey) throw new Error('密码库未解锁')
    // 调用解密 API
    return Argon2Api.decryptRecord(encrypted, vaultState.value.masterKey)
  }

  return {
    isUnlocked: computed(() => vaultState.value.isUnlocked),
    kdfConfig: computed(() => vaultState.value.kdfConfig),
    verifyIv: computed(() => vaultState.value.verifyIv),
    verifyCiphertext: computed(() => vaultState.value.verifyCiphertext),
    setupVaultWithKeyFile,
    unlock,
    lock,
    saveRecord,
    readRecord
  }
})
