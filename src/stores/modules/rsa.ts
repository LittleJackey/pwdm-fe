import { isPrivateKeyValid, sign, verify } from '@/utils/rsa'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useRsaStore = defineStore(
  'pwdm-rsa',
  () => {
    const publicKeyPemContent = ref('')
    const privateKeyPemContent = ref('')

    // 优化：使用 computed 实时判断私钥是否有效且匹配
    const isKeyValidAndMatched = computed(() => {
      if (!publicKeyPemContent.value || !privateKeyPemContent.value) return false
      // 基础格式校验
      if (!isPrivateKeyValid(privateKeyPemContent.value)) return false

      try {
        // 签名验签测试匹配性
        const data = 'verify-match-check'
        const signature = sign(data, privateKeyPemContent.value)
        return verify(data, signature, publicKeyPemContent.value)
        // eslint-disable-next-line
      } catch (e) {
        return false
      }
    })

    const setPrivateKeyPemContent = (key: string) => {
      if (!isPrivateKeyValid(key)) {
        throw new Error('私钥格式无效')
      }
      privateKeyPemContent.value = key

      // 设置后立即检查匹配性
      if (!isKeyValidAndMatched.value) {
        // 如果不匹配，设为空串
        privateKeyPemContent.value = ''
        throw new Error('私钥与当前公钥不匹配')
      }
    }

    const clearPrivateKey = () => {
      privateKeyPemContent.value = ''
    }

    return {
      publicKeyPemContent,
      privateKeyPemContent,
      isKeyValidAndMatched,
      setPrivateKeyPemContent,
      clearPrivateKey
    }
  },
  {
    // 关闭自动持久化
    persist: false
  }
)
