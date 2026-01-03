<script setup lang="ts">
import type { AccountVO } from '@/types/account'
import { decrypt } from '@/utils/rsa'
import { ElMessage } from 'element-plus'
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useRsaStore } from '@/stores/modules/rsa'

const props = defineProps<{
  row: AccountVO
  decryptKeyDialogVisible: boolean
  decryptKeyDialogTitle: string
  decryptKeyDialogMessage: string
  onRemove: () => void
}>()

const emits = defineEmits<{
  (e: 'trigger-upload'): void
  (e: 'update:decrypt-key-dialog-visible', v: boolean): void
  (e: 'update:decrypt-key-dialog-title', v: string): void
  (e: 'update:decrypt-key-dialog-message', v: string): void
}>()

const rsaStore = useRsaStore()
const decryptPassword = (pwd: string) => {
  if (rsaStore.lastIsCorrectPrivateKeyResult) {
    try {
      return decrypt(pwd, rsaStore.privateKeyPemContent)
    } catch (e) {
      console.error('解密失败', e)
      props.onRemove()
    }
  }
  return '待解密'
}

const password = computed(() => decryptPassword(props.row.password))

const { copy, isSupported } = useClipboard()

const handleCopy = async (text: string) => {
  if (!isSupported.value) {
    ElMessage.error({ message: '当前浏览器不支持自动复制', plain: true })
    return
  }
  await copy(text)
  ElMessage.success({ message: '已复制到剪贴板', plain: true })
}

const handleClickCipher = () => {
  emits('update:decrypt-key-dialog-title', '需要密钥解密')
  emits('update:decrypt-key-dialog-message', '此内容已加密，需要密钥才能解密')
  emits('update:decrypt-key-dialog-visible', true)
}
</script>

<template>
  <div>
    <el-descriptions border :column="3" title="详细信息">
      <el-descriptions-item label="网站">
        {{ props.row.website }}
      </el-descriptions-item>

      <el-descriptions-item label="url">
        <el-link type="primary" :href="props.row.url" target="_blank" underline="hover">
          {{ props.row.url }}
        </el-link>
      </el-descriptions-item>

      <el-descriptions-item label="发布页">
        <el-link type="primary" :href="props.row.officialAccessUrl" target="_blank" underline="hover">
          {{ props.row.officialAccessUrl }}
        </el-link>
      </el-descriptions-item>

      <el-descriptions-item label="用户名" class-name="green-content">
        <el-tooltip content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(props.row.username)">
            {{ props.row.username }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="密码" class-name="red-content">
        <span v-if="password === '待解密'" @click="handleClickCipher">
          {{ password }}
        </span>
        <el-tooltip v-else content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(password)">
            {{ password }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="账号拥有者">
        {{ props.row.owner }}
      </el-descriptions-item>

      <el-descriptions-item label="昵称">
        <el-tooltip content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(props.row.nickname)">
            {{ props.row.nickname }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="手机号">
        <el-tooltip content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(props.row.phone)">
            {{ props.row.phone }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="邮箱">
        <el-tooltip content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(props.row.email)">
            {{ props.row.email }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="二次验证服务商">
        {{ props.row.mfaProvider }}
      </el-descriptions-item>

      <el-descriptions-item label="恢复代码">
        {{ props.row.recoveryCodes }}
      </el-descriptions-item>

      <el-descriptions-item label="第二邮箱">
        {{ props.row.secEmail }}
      </el-descriptions-item>

      <el-descriptions-item label="备注">
        {{ props.row.notes }}
      </el-descriptions-item>

      <el-descriptions-item label="创建时间">
        {{ props.row.createTime }}
      </el-descriptions-item>

      <el-descriptions-item label="修改时间">
        {{ props.row.updateTime }}
      </el-descriptions-item>

      <el-descriptions-item label="安全问题1" v-if="props.row.securityQuestion1">
        {{ props.row.securityQuestion1 }}
      </el-descriptions-item>

      <el-descriptions-item label="安全答案1" v-if="props.row.securityQuestion1">
        {{ props.row.securityAnswer1 }}
      </el-descriptions-item>

      <el-descriptions-item label="安全问题2" v-if="props.row.securityQuestion2">
        {{ props.row.securityQuestion2 }}
      </el-descriptions-item>

      <el-descriptions-item label="安全答案2" v-if="props.row.securityQuestion2">
        {{ props.row.securityAnswer2 }}
      </el-descriptions-item>

      <el-descriptions-item label="安全问题3" v-if="props.row.securityQuestion3">
        {{ props.row.securityQuestion3 }}
      </el-descriptions-item>

      <el-descriptions-item label="安全答案3" v-if="props.row.securityQuestion3">
        {{ props.row.securityAnswer3 }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<style lang="scss" scoped>
.clickable-text {
  cursor: pointer;
  border-bottom: 1px dashed #ccc; /* 加个虚线提示可点击，可选 */
}
.clickable-text:hover {
  color: #409eff;
}

:deep(.green-content) {
  background: var(--el-color-success-light-9) !important;
}

:deep(.red-content) {
  background: var(--el-color-danger-light-9);
}
</style>
