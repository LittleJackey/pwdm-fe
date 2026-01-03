import { isPrivateKeyValid, sign, verify } from '@/utils/rsa'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useRsaStore = defineStore(
  'pwdm-rsa',
  () => {
    const publicKeyPemContent = ref('')
    const privateKeyPemContent = ref('')

    const lastIsCorrectPrivateKeyResult = ref(false)
    const isCorrectPrivateKey = () => {
      if (publicKeyPemContent.value && privateKeyPemContent.value) {
        try {
          const data = 'verify'
          const signature = sign(data, privateKeyPemContent.value)
          lastIsCorrectPrivateKeyResult.value = true
          return verify(data, signature, publicKeyPemContent.value)
          // eslint-disable-next-line
        } catch (e) {
          lastIsCorrectPrivateKeyResult.value = false
          return false
        }
      }
      lastIsCorrectPrivateKeyResult.value = false
      return false
    }

    const setPrivateKeyPemContent = (key: string): { success: boolean; message?: string } => {
      // 验证格式
      if (!isPrivateKeyValid(key)) {
        lastIsCorrectPrivateKeyResult.value = false
        return {
          success: false,
          message: '私钥格式无效'
        }
      }

      // 验证秘钥是否配对
      privateKeyPemContent.value = key

      try {
        if (!isCorrectPrivateKey()) {
          return {
            success: false,
            message: '私钥与公钥不匹配'
          }
        }

        return { success: true }
        // eslint-disable-next-line
      } catch (e) {
        privateKeyPemContent.value = ''
        return {
          success: false,
          message: '密钥验证过程出错'
        }
      }
    }

    const removePrivateKey = () => {
      privateKeyPemContent.value = ''
      lastIsCorrectPrivateKeyResult.value = false
    }

    return {
      publicKeyPemContent,
      privateKeyPemContent,
      lastIsCorrectPrivateKeyResult,
      isCorrectPrivateKey,
      setPrivateKeyPemContent,
      removePrivateKey
    }
  },
  {
    // 关闭自动持久化
    persist: false
  }
)
