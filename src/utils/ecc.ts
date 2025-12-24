import { ec as EC } from 'elliptic'
import CryptoJS from 'crypto-js'

const ec = new EC('p256')
const eccPublicKeyBase64 =
  'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE1GuXw8p0TQZLozc94tIHuzYq/eBISMnP/J+DZghbTkQSbkqS7CNzbSxREP98eeiaomDRNk1bdXzCZcSkkJx5vg=='

/**
 * ECC 加密函数
 */
export const eccEncrypt = (plainText: string): string => {
  try {
    // 1. 解析后端给的公钥
    const pubKeyBin = atob(eccPublicKeyBase64)
    const pubKeyArray = new Uint8Array(pubKeyBin.length)
    for (let i = 0; i < pubKeyBin.length; i++) {
      // 修复报错3：使用 ! 断言，因为我们确信 i 在数组范围内
      pubKeyArray[i] = pubKeyBin.charCodeAt(i)!
    }

    let rawPubKey = pubKeyArray
    if (pubKeyArray.length > 65) {
      rawPubKey = pubKeyArray.slice(pubKeyArray.length - 65)
    }

    // 2. 生成前端临时密钥
    const ephemeralKey = ec.genKeyPair()
    const ephemeralPubPoint = ephemeralKey.getPublic()

    // 3. ECDH 协商
    const serverKey = ec.keyFromPublic(rawPubKey).getPublic()
    const sharedSecret = ephemeralKey.derive(serverKey)

    // 4. 计算 AES Key
    const secretBytes = sharedSecret.toArray('be', 32)

    // 修复报错1：去掉 as any，改用 Uint8Array 包装
    // CryptoJS.lib.WordArray.create 支持传入 Uint8Array
    const secretWordSrc = CryptoJS.lib.WordArray.create(new Uint8Array(secretBytes))

    const aesKey = CryptoJS.SHA256(secretWordSrc).clone()
    aesKey.sigBytes = 16
    aesKey.clamp()

    // 5. 生成 IV
    const iv = CryptoJS.lib.WordArray.random(16)

    // 6. AES 加密
    const encrypted = CryptoJS.AES.encrypt(plainText, aesKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    // 7. 拼接
    const ephPubBytes = new Uint8Array(ephemeralPubPoint.encode('array', false))
    const ivBytes = wordArrayToUint8Array(iv)
    const cipherBytes = base64ToUint8Array(encrypted.toString())

    const finalBuffer = new Uint8Array(ephPubBytes.length + ivBytes.length + cipherBytes.length)
    finalBuffer.set(ephPubBytes, 0)
    finalBuffer.set(ivBytes, ephPubBytes.length)
    finalBuffer.set(cipherBytes, ephPubBytes.length + ivBytes.length)

    return uint8ArrayToBase64(finalBuffer)
  } catch (error) {
    console.error('ECC 加密失败:', error)
    throw error
  }
}

// --- 辅助函数 (已修复类型报错) ---

const wordArrayToUint8Array = (wordArray: CryptoJS.lib.WordArray): Uint8Array => {
  const words = wordArray.words
  const sigBytes = wordArray.sigBytes
  const u8 = new Uint8Array(sigBytes)
  for (let i = 0; i < sigBytes; i++) {
    // 修复报错2：使用 ! 非空断言
    // 逻辑上 words 数组在 i >>> 2 处一定有值，但 TS 不知道，所以要告诉它
    const byte = (words[i >>> 2]! >>> (24 - (i % 4) * 8)) & 0xff
    u8[i] = byte
  }
  return u8
}

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    // 修复报错3：binaryString.charCodeAt(i) 必定返回 number
    // 但如果你的 TS 认为可能 undefined，加上 !
    bytes[i] = binaryString.charCodeAt(i)!
  }
  return bytes
}

const uint8ArrayToBase64 = (buffer: Uint8Array): string => {
  let binary = ''
  const len = buffer.byteLength
  for (let i = 0; i < len; i++) {
    // 修复报错3：buffer[i] 在严格模式下被认为是 number | undefined
    // 使用 ! 断言它一定存在
    binary += String.fromCharCode(buffer[i]!)
  }
  return btoa(binary)
}
