/**
 * ArrayBuffer 转 Base64 字符串
 */
export function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

/**
 * Base64 字符串转 ArrayBuffer
 */
export function base64ToBuf(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * 生成指定长度的随机字节并返回 Base64
 */
export function generateRandomBytes(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return bufToBase64(bytes.buffer)
}
