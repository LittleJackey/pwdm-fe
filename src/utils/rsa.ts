import forge from 'node-forge'

/**
 * RSA 加密 (对应 Java: RSA/ECB/OAEPWithSHA-512AndMGF1Padding)
 * @param plainText 明文
 * @param publicKeyPem 公钥 (PEM格式字符串)
 */
export const encrypt = (plainText: string, publicKeyPem: string): string => {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)

    // 将字符串转为 UTF-8 字节
    const buffer = forge.util.createBuffer(plainText, 'utf8')

    // 核心配置：必须与 Java 端的 OAEPParameterSpec 完全一致
    const encrypted = publicKey.encrypt(buffer.getBytes(), 'RSA-OAEP', {
      md: forge.md.sha512.create(), // 主哈希: SHA-512
      mgf1: {
        md: forge.md.sha512.create() // MGF1哈希: SHA-512
      }
    })

    // 转 Base64
    return forge.util.encode64(encrypted)
  } catch (e) {
    console.error('RSA Encryption Failed:', e)
    throw e
  }
}

/**
 * RSA 解密 (对应 Java: RSA/ECB/OAEPWithSHA-512AndMGF1Padding)
 * @param encryptedBase64 密文 (Base64)
 * @param privateKeyPem 私钥 (PEM格式字符串)
 */
export const decrypt = (encryptedBase64: string, privateKeyPem: string): string => {
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)

    // Base64 解码
    const encryptedBytes = forge.util.decode64(encryptedBase64)

    // 解密配置：必须与加密时一致
    const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
      md: forge.md.sha512.create(),
      mgf1: {
        md: forge.md.sha512.create()
      }
    })

    return forge.util.decodeUtf8(decrypted)
  } catch (e) {
    console.error('RSA Decryption Failed:', e)
    throw e
  }
}

/**
 * RSA 签名 (对应 Java: SHA512withRSA)
 * @param data 要签名的数据
 * @param privateKeyPem 私钥
 */
export const sign = (data: string, privateKeyPem: string): string => {
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)

    // 1. 创建 SHA-512 摘要
    const md = forge.md.sha512.create()
    md.update(data, 'utf8')

    // 2. 签名
    const signature = privateKey.sign(md)

    return forge.util.encode64(signature)
  } catch (e) {
    console.error('RSA Sign Failed:', e)
    throw e
  }
}

/**
 * RSA 验签 (对应 Java: SHA512withRSA)
 * @param data 原数据
 * @param signatureBase64 签名 (Base64)
 * @param publicKeyPem 公钥
 */
export const verify = (data: string, signatureBase64: string, publicKeyPem: string): boolean => {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)

    // 1. 创建 SHA-512 摘要
    const md = forge.md.sha512.create()
    md.update(data, 'utf8')

    // 2. 验证
    const signature = forge.util.decode64(signatureBase64)
    return publicKey.verify(md.digest().bytes(), signature)
  } catch (e) {
    console.error('RSA Verify Failed:', e)
    return false
  }
}

/**
 * 验证是否为有效的 PEM 格式 RSA 私钥
 * @param keyContent 用户输入的字符串
 */
export const isPrivateKeyValid = (keyContent: string): boolean => {
  if (!keyContent) return false

  try {
    // 1. 去除首尾空白
    const trimmedKey = keyContent.trim()

    // 2. 尝试解析
    // 如果格式不对（比如Base64损坏、缺少Header），这里会直接报错
    const privateKey = forge.pki.privateKeyFromPem(trimmedKey)

    // 3. 进一步检查：确保解析出来的是 RSA 密钥
    // 虽然 fromPem 通常只解析 RSA，但防御性编程判断一下是否包含 n (模数) and e (指数)
    return !!(privateKey.n && privateKey.e)
  } catch (e) {
    // 解析失败，说明不是有效的 PEM 私钥
    console.error('RSA PrivateKey Invalid:', e)
    return false
  }
}
