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

// 通用解密函数
const decryptContent = (cipherText: string | undefined | null) => {
  // 如果数据库里存的是空，直接返回空，不要显示“待解密”
  if (!cipherText) return ''

  if (rsaStore.isKeyValidAndMatched) {
    try {
      return decrypt(cipherText, rsaStore.privateKeyPemContent)
    } catch (e) {
      console.error('解密失败', e)
      // 如果解密失败（可能是密钥不对），可以选择调用 props.onRemove() 或显示错误
      props.onRemove()
    }
  }
  return '待解密'
}

// 创建各个字段的 Computed 属性
const password = computed(() => decryptContent(props.row.password))
const recoveryCodes = computed(() => decryptContent(props.row.recoveryCodes))

const securityQuestion1 = computed(() => decryptContent(props.row.securityQuestion1))
const securityAnswer1 = computed(() => decryptContent(props.row.securityAnswer1))

const securityQuestion2 = computed(() => decryptContent(props.row.securityQuestion2))
const securityAnswer2 = computed(() => decryptContent(props.row.securityAnswer2))

const securityQuestion3 = computed(() => decryptContent(props.row.securityQuestion3))
const securityAnswer3 = computed(() => decryptContent(props.row.securityAnswer3))

const { copy, isSupported } = useClipboard()

const handleCopy = async (text: string) => {
  if (!text || text === '待解密') return // 防止误操作
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
        <span v-if="password === '待解密'" class="clickable-text" @click="handleClickCipher">
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
        <span v-if="recoveryCodes === '待解密'" class="clickable-text" @click="handleClickCipher">
          {{ recoveryCodes }}
        </span>
        <el-tooltip v-else-if="recoveryCodes" content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(recoveryCodes)">
            {{ recoveryCodes }}
          </span>
        </el-tooltip>
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
        <span v-if="securityQuestion1 === '待解密'" class="clickable-text" @click="handleClickCipher">
          {{ securityQuestion1 }}
        </span>
        <el-tooltip v-else content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(securityQuestion1)">
            {{ securityQuestion1 }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="安全答案1" v-if="props.row.securityAnswer1">
        <span v-if="securityAnswer1 === '待解密'" class="clickable-text" @click="handleClickCipher">
          {{ securityAnswer1 }}
        </span>
        <el-tooltip v-else content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(securityAnswer1)">
            {{ securityAnswer1 }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="安全问题2" v-if="props.row.securityQuestion2">
        <span v-if="securityQuestion2 === '待解密'" class="clickable-text" @click="handleClickCipher">
          {{ securityQuestion2 }}
        </span>
        <el-tooltip v-else content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(securityQuestion2)">
            {{ securityQuestion2 }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="安全答案2" v-if="props.row.securityAnswer2">
        <span v-if="securityAnswer2 === '待解密'" class="clickable-text" @click="handleClickCipher">
          {{ securityAnswer2 }}
        </span>
        <el-tooltip v-else content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(securityAnswer2)">
            {{ securityAnswer2 }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="安全问题3" v-if="props.row.securityQuestion3">
        <span v-if="securityQuestion3 === '待解密'" class="clickable-text" @click="handleClickCipher">
          {{ securityQuestion3 }}
        </span>
        <el-tooltip v-else content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(securityQuestion3)">
            {{ securityQuestion3 }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="安全答案3" v-if="props.row.securityAnswer3">
        <span v-if="securityAnswer3 === '待解密'" class="clickable-text" @click="handleClickCipher">
          {{ securityAnswer3 }}
        </span>
        <el-tooltip v-else content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(securityAnswer3)">
            {{ securityAnswer3 }}
          </span>
        </el-tooltip>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<style lang="scss" scoped>
.clickable-text {
  cursor: pointer;
  border-bottom: 1px dashed #ccc; /* 加个虚线提示可点击 */
  /* 增加一点内边距让点击更容易 */
  padding-bottom: 1px;
}
.clickable-text:hover {
  color: #409eff;
  border-bottom-color: #409eff;
}

:deep(.green-content) {
  background: var(--el-color-success-light-9) !important;
}

:deep(.red-content) {
  background: var(--el-color-danger-light-9);
}
</style>
