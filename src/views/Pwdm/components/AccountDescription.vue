<script setup lang="ts">
import type { AccountVO } from '@/types/account'
import { ElMessage } from 'element-plus'
import { reactive, ref, watch } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useVaultStore } from '@/stores/modules/vault'
import type { EncryptedRecord } from '@/types/crypto'
import { View, Hide, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  row: AccountVO
  checkAndRequestMasterKey: () => Promise<boolean>
}>()

const emit = defineEmits<{
  (e: 'edit', row: AccountVO): void
  (e: 'delete', id: number): void
}>()

const vaultStore = useVaultStore()

// 创建各个字段的 ref 属性
const password = ref('待解密')
const recoveryCodes = ref('待解密')
const securityQuestion1 = ref('待解密')
const securityAnswer1 = ref('待解密')
const securityQuestion2 = ref('待解密')
const securityAnswer2 = ref('待解密')
const securityQuestion3 = ref('待解密')
const securityAnswer3 = ref('待解密')

const visibility = reactive({
  password: true,
  recoveryCodes: true,
  securityQuestion1: true,
  securityAnswer1: true,
  securityQuestion2: true,
  securityAnswer2: true,
  securityQuestion3: true,
  securityAnswer3: true
})

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

// 通用解密函数
const decryptContent = async (cipherText: string | undefined | null, iv: string | undefined | null) => {
  console.log('0. cipherText =', cipherText, 'iv = ', iv, 'row=', props.row)

  if (!cipherText || !iv) {
    ElMessage.error({ message: '解密失败：密文或盐值出错', plain: true })
    return
  }

  if (vaultStore.isUnlocked) {
    try {
      const encryptedRecord: EncryptedRecord = {
        iv: iv,
        ciphertext: cipherText
      }

      console.log('encryptedRecord = ', encryptedRecord)
      const decrypted = await vaultStore.readRecord(encryptedRecord)
      return decrypted
    } catch (e) {
      console.error('解密失败', e)
      ElMessage.error({ message: '解密失败', plain: true })
    }
  } else {
    ElMessage.error({ message: '请先解锁主密钥', plain: true })
  }
}

const isPasswordDecrypted = ref(false)
const handleDecryptPassword = async () => {
  //  确保已解锁
  if (!vaultStore.isUnlocked) {
    const success = await props.checkAndRequestMasterKey()
    if (!success) return // 解锁失败或用户取消，直接退出
  }

  const decrypted = await decryptContent(props.row.password, props.row.pwdIv)

  if (decrypted) {
    password.value = decrypted
    isPasswordDecrypted.value = true
  }
}

const isRecoveryCodesDecrypted = ref(false)
const handleDecryptRecoveryCodes = async () => {
  //  确保已解锁
  if (!vaultStore.isUnlocked) {
    const success = await props.checkAndRequestMasterKey()
    if (!success) return // 解锁失败或用户取消，直接退出
  }

  const decrypted = await decryptContent(props.row.recoveryCodes, props.row.recoveryCodesIv)

  if (decrypted) {
    recoveryCodes.value = decrypted
    isRecoveryCodesDecrypted.value = true
  }
}

const isSecurityQuestion1Decrypted = ref(false)
const handleDecryptSecurityQuestion1 = async () => {
  //  确保已解锁
  if (!vaultStore.isUnlocked) {
    const success = await props.checkAndRequestMasterKey()
    if (!success) return // 解锁失败或用户取消，直接退出
  }

  const decrypted = await decryptContent(props.row.securityQuestion1, props.row.sq1Iv)

  if (decrypted) {
    securityQuestion1.value = decrypted
    isSecurityQuestion1Decrypted.value = true
  }
}

const isSecurityAnswer1Decrypted = ref(false)
const handleDecryptSecurityAnswer1 = async () => {
  //  确保已解锁
  if (!vaultStore.isUnlocked) {
    const success = await props.checkAndRequestMasterKey()
    if (!success) return // 解锁失败或用户取消，直接退出
  }

  const decrypted = await decryptContent(props.row.securityAnswer1, props.row.sa1Iv)

  if (decrypted) {
    securityAnswer1.value = decrypted
    isSecurityAnswer1Decrypted.value = true
  }
}

const isSecurityQuestion2Decrypted = ref(false)
const handleDecryptSecurityQuestion2 = async () => {
  //  确保已解锁
  if (!vaultStore.isUnlocked) {
    const success = await props.checkAndRequestMasterKey()
    if (!success) return // 解锁失败或用户取消，直接退出
  }

  const decrypted = await decryptContent(props.row.securityQuestion2, props.row.sq2Iv)

  if (decrypted) {
    securityQuestion2.value = decrypted
    isSecurityQuestion2Decrypted.value = true
  }
}

const isSecurityAnswer2Decrypted = ref(false)
const handleDecryptSecurityAnswer2 = async () => {
  //  确保已解锁
  if (!vaultStore.isUnlocked) {
    const success = await props.checkAndRequestMasterKey()
    if (!success) return // 解锁失败或用户取消，直接退出
  }

  const decrypted = await decryptContent(props.row.securityAnswer2, props.row.sa2Iv)

  if (decrypted) {
    securityAnswer2.value = decrypted
    isSecurityAnswer2Decrypted.value = true
  }
}

const isSecurityQuestion3Decrypted = ref(false)
const handleDecryptSecurityQuestion3 = async () => {
  //  确保已解锁
  if (!vaultStore.isUnlocked) {
    const success = await props.checkAndRequestMasterKey()
    if (!success) return // 解锁失败或用户取消，直接退出
  }

  const decrypted = await decryptContent(props.row.securityQuestion3, props.row.sq3Iv)

  if (decrypted) {
    securityQuestion3.value = decrypted
    isSecurityQuestion3Decrypted.value = true
  }
}

const isSecurityAnswer3Decrypted = ref(false)
const handleDecryptSecurityAnswer3 = async () => {
  //  确保已解锁
  if (!vaultStore.isUnlocked) {
    const success = await props.checkAndRequestMasterKey()
    if (!success) return // 解锁失败或用户取消，直接退出
  }

  const decrypted = await decryptContent(props.row.securityAnswer3, props.row.sa3Iv)

  if (decrypted) {
    securityAnswer3.value = decrypted
    isSecurityAnswer3Decrypted.value = true
  }
}

watch(
  () => vaultStore.isUnlocked,
  (newVal) => {
    if (!newVal) {
      isPasswordDecrypted.value = false
      isRecoveryCodesDecrypted.value = false
      isSecurityQuestion1Decrypted.value = false
      isSecurityAnswer1Decrypted.value = false
      isSecurityQuestion2Decrypted.value = false
      isSecurityAnswer2Decrypted.value = false
      isSecurityQuestion3Decrypted.value = false
      isSecurityAnswer3Decrypted.value = false
      password.value = '待解密'
      recoveryCodes.value = '待解密'
      securityQuestion1.value = '待解密'
      securityAnswer1.value = '待解密'
      securityQuestion2.value = '待解密'
      securityAnswer2.value = '待解密'
      securityQuestion3.value = '待解密'
      securityAnswer3.value = '待解密'
    }
  }
)

watch(
  () => props.row.password,
  () => {
    isPasswordDecrypted.value = false
    password.value = '待解密'
  }
)

watch(
  () => props.row.recoveryCodes,
  () => {
    isRecoveryCodesDecrypted.value = false
    recoveryCodes.value = '待解密'
  }
)

watch(
  () => props.row.securityQuestion1,
  () => {
    isSecurityQuestion1Decrypted.value = false
    securityQuestion1.value = '待解密'
  }
)

watch(
  () => props.row.securityAnswer1,
  () => {
    isSecurityAnswer1Decrypted.value = false
    securityAnswer1.value = '待解密'
  }
)

watch(
  () => props.row.securityQuestion2,
  () => {
    isSecurityQuestion2Decrypted.value = false
    securityQuestion2.value = '待解密'
  }
)

watch(
  () => props.row.securityAnswer2,
  () => {
    isSecurityAnswer2Decrypted.value = false
    securityAnswer2.value = '待解密'
  }
)

watch(
  () => props.row.securityQuestion3,
  () => {
    isSecurityQuestion3Decrypted.value = false
    securityQuestion3.value = '待解密'
  }
)

watch(
  () => props.row.securityAnswer3,
  () => {
    isSecurityAnswer3Decrypted.value = false
    securityAnswer3.value = '待解密'
  }
)
</script>

<template>
  <div class="expand-detail-card">
    <el-descriptions border :column="3" label-width="200">
      <template #title>
        <div class="descriptions-header">
          <div class="descriptions-title">
            <el-icon class="title-icon"><InfoFilled /></el-icon>
            <span>详细信息</span>
          </div>
          <div class="header-actions">
            <el-button class="btn-edit" size="small" @click="emit('edit', props.row)">编辑</el-button>
            <el-button class="btn-delete" size="small" @click="emit('delete', props.row.id)">删除</el-button>
          </div>
        </div>
      </template>
      <!-- 第一列 -->
      <el-descriptions-item v-if="props.row.website" label="网站名" width="500">
        <span>
          {{ props.row.website }}
        </span>
      </el-descriptions-item>

      <el-descriptions-item v-else label="网站名" width="500">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <!-- 第二列 -->
      <el-descriptions-item label="url" width="500">
        <el-link class="break-text" type="primary" :href="props.row.url" target="_blank" underline="hover">
          <span>
            {{ props.row.url }}
          </span>
        </el-link>
      </el-descriptions-item>

      <el-descriptions-item v-if="props.row.officialAccessUrl" label="发布页" width="500">
        <el-link type="primary" :href="props.row.officialAccessUrl" target="_blank" underline="hover">
          <span>
            {{ props.row.officialAccessUrl }}
          </span>
        </el-link>
      </el-descriptions-item>

      <!-- 第三列 -->
      <el-descriptions-item v-else label="发布页" width="500">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <el-descriptions-item label="用户名" class-name="green-content">
        <el-tooltip content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(props.row.username)">
            {{ props.row.username }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item label="密码" class-name="red-content">
        <!-- 解密前：text 在“待解密”文字上 -->
        <template v-if="!isPasswordDecrypted">
          <el-tooltip content="点击解密" placement="bottom">
            <span class="clickable-text" @click="handleDecryptPassword">
              {{ password }}
            </span>
          </el-tooltip>
        </template>
        <!-- 解密后：眼睛+明文整体容器，但不再用外层 tooltip -->
        <template v-else>
          <div class="decrypted-field">
            <!-- 明文区域：只在眼睛睁开时有 tooltip，闭上眼睛时不展示 tooltip（避免干扰） -->
            <el-tooltip v-if="visibility.password" content="点击复制" placement="bottom">
              <span class="clickable-text" @click="handleCopy(password)">
                {{ password }}
              </span>
            </el-tooltip>
            <!-- 眼睛闭合时，文字为模糊态，点击即显示，不附加 tooltip -->
            <span v-else class="clickable-text blur-text" @click="visibility.password = true">
              {{ password }}
            </span>
            <!-- 小眼睛图标：独立 tooltip，提示“点击隐藏”或“点击显示” -->
            <el-tooltip :content="visibility.password ? '点击隐藏' : '点击显示'" placement="bottom">
              <el-icon class="eye-icon" @click.stop="visibility.password = !visibility.password">
                <View v-if="visibility.password" />
                <Hide v-else />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-descriptions-item>

      <el-descriptions-item v-if="props.row.owner" label="账号拥有者">
        <span>
          {{ props.row.owner }}
        </span>
      </el-descriptions-item>

      <el-descriptions-item v-else label="账号拥有者">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <el-descriptions-item v-if="props.row.nickname" label="昵称">
        <el-tooltip content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(props.row.nickname)">
            {{ props.row.nickname }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item v-else label="昵称">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <el-descriptions-item v-if="props.row.phone" label="手机号">
        <el-tooltip content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(props.row.phone)">
            {{ props.row.phone }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item v-else label="手机号">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <el-descriptions-item v-if="props.row.email" label="邮箱">
        <el-tooltip content="点击复制" placement="bottom">
          <span class="clickable-text" @click="handleCopy(props.row.email)">
            {{ props.row.email }}
          </span>
        </el-tooltip>
      </el-descriptions-item>

      <el-descriptions-item v-else label="邮箱">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <el-descriptions-item v-if="props.row.mfaProvider" label="二次验证服务商">
        <span>
          {{ props.row.mfaProvider }}
        </span>
      </el-descriptions-item>

      <el-descriptions-item v-else label="二次验证服务商">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <!-- 恢复代码 -->
      <el-descriptions-item v-if="props.row.recoveryCodes" label="恢复代码">
        <template v-if="!isRecoveryCodesDecrypted">
          <el-tooltip content="点击解密" placement="bottom">
            <span class="clickable-text" @click="handleDecryptRecoveryCodes">
              {{ recoveryCodes }}
            </span>
          </el-tooltip>
        </template>
        <template v-else>
          <div class="decrypted-field">
            <el-tooltip v-if="visibility.recoveryCodes" content="点击复制" placement="bottom">
              <span class="clickable-text" @click="handleCopy(recoveryCodes)">
                {{ recoveryCodes }}
              </span>
            </el-tooltip>
            <span v-else class="clickable-text blur-text" @click="visibility.recoveryCodes = true">
              {{ recoveryCodes }}
            </span>
            <el-tooltip :content="visibility.recoveryCodes ? '点击隐藏' : '点击显示'" placement="bottom">
              <el-icon class="eye-icon" @click.stop="visibility.recoveryCodes = !visibility.recoveryCodes">
                <View v-if="visibility.recoveryCodes" />
                <Hide v-else />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-descriptions-item>

      <el-descriptions-item v-else label="恢复代码">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <el-descriptions-item v-if="props.row.secEmail" label="第二邮箱">
        <span>
          {{ props.row.secEmail }}
        </span>
      </el-descriptions-item>

      <el-descriptions-item v-else label="第二邮箱">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <el-descriptions-item label="备注">
        <span>
          {{ props.row.notes }}
        </span>
      </el-descriptions-item>

      <el-descriptions-item label="创建时间">
        <span>
          {{ props.row.createTime }}
        </span>
      </el-descriptions-item>

      <el-descriptions-item label="修改时间">
        <span>
          {{ props.row.updateTime }}
        </span>
      </el-descriptions-item>

      <!-- 安全问题1 -->
      <el-descriptions-item v-if="props.row.securityQuestion1" label="安全问题1">
        <template v-if="!isSecurityQuestion1Decrypted">
          <el-tooltip content="点击解密" placement="bottom">
            <span class="clickable-text" @click="handleDecryptSecurityQuestion1">
              {{ securityQuestion1 }}
            </span>
          </el-tooltip>
        </template>
        <template v-else>
          <div class="decrypted-field">
            <el-tooltip v-if="visibility.securityQuestion1" content="点击复制" placement="bottom">
              <span class="clickable-text" @click="handleCopy(securityQuestion1)">
                {{ securityQuestion1 }}
              </span>
            </el-tooltip>
            <span v-else class="clickable-text blur-text" @click="visibility.securityQuestion1 = true">
              {{ securityQuestion1 }}
            </span>
            <el-tooltip :content="visibility.securityQuestion1 ? '点击隐藏' : '点击显示'" placement="bottom">
              <el-icon class="eye-icon" @click.stop="visibility.securityQuestion1 = !visibility.securityQuestion1">
                <View v-if="visibility.securityQuestion1" />
                <Hide v-else />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-descriptions-item>

      <el-descriptions-item v-else label="安全问题1">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <!-- 安全答案1 -->
      <el-descriptions-item v-if="props.row.securityAnswer1" label="安全答案1">
        <template v-if="!isSecurityAnswer1Decrypted">
          <el-tooltip content="点击解密" placement="bottom">
            <span class="clickable-text" @click="handleDecryptSecurityAnswer1">
              {{ securityAnswer1 }}
            </span>
          </el-tooltip>
        </template>
        <template v-else>
          <div class="decrypted-field">
            <el-tooltip v-if="visibility.securityAnswer1" content="点击复制" placement="bottom">
              <span class="clickable-text" @click="handleCopy(securityAnswer1)">
                {{ securityAnswer1 }}
              </span>
            </el-tooltip>
            <span v-else class="clickable-text blur-text" @click="visibility.securityAnswer1 = true">
              {{ securityAnswer1 }}
            </span>
            <el-tooltip :content="visibility.securityAnswer1 ? '点击隐藏' : '点击显示'" placement="bottom">
              <el-icon class="eye-icon" @click.stop="visibility.securityAnswer1 = !visibility.securityAnswer1">
                <View v-if="visibility.securityAnswer1" />
                <Hide v-else />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-descriptions-item>

      <el-descriptions-item v-else label="安全答案1">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <!-- 安全问题2 -->
      <el-descriptions-item v-if="props.row.securityQuestion2" label="安全问题2">
        <template v-if="!isSecurityQuestion2Decrypted">
          <el-tooltip content="点击解密" placement="bottom">
            <span class="clickable-text" @click="handleDecryptSecurityQuestion2">
              {{ securityQuestion2 }}
            </span>
          </el-tooltip>
        </template>
        <template v-else>
          <div class="decrypted-field">
            <el-tooltip v-if="visibility.securityQuestion2" content="点击复制" placement="bottom">
              <span class="clickable-text" @click="handleCopy(securityQuestion2)">
                {{ securityQuestion2 }}
              </span>
            </el-tooltip>
            <span v-else class="clickable-text blur-text" @click="visibility.securityQuestion2 = true">
              {{ securityQuestion2 }}
            </span>
            <el-tooltip :content="visibility.securityQuestion2 ? '点击隐藏' : '点击显示'" placement="bottom">
              <el-icon class="eye-icon" @click.stop="visibility.securityQuestion2 = !visibility.securityQuestion2">
                <View v-if="visibility.securityQuestion2" />
                <Hide v-else />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-descriptions-item>

      <el-descriptions-item v-else label="安全问题2">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <!-- 安全答案2 -->
      <el-descriptions-item v-if="props.row.securityAnswer2" label="安全答案2">
        <template v-if="!isSecurityAnswer2Decrypted">
          <el-tooltip content="点击解密" placement="bottom">
            <span class="clickable-text" @click="handleDecryptSecurityAnswer2">
              {{ securityAnswer2 }}
            </span>
          </el-tooltip>
        </template>
        <template v-else>
          <div class="decrypted-field">
            <el-tooltip v-if="visibility.securityAnswer2" content="点击复制" placement="bottom">
              <span class="clickable-text" @click="handleCopy(securityAnswer2)">
                {{ securityAnswer2 }}
              </span>
            </el-tooltip>
            <span v-else class="clickable-text blur-text" @click="visibility.securityAnswer2 = true">
              {{ securityAnswer2 }}
            </span>
            <el-tooltip :content="visibility.securityAnswer2 ? '点击隐藏' : '点击显示'" placement="bottom">
              <el-icon class="eye-icon" @click.stop="visibility.securityAnswer2 = !visibility.securityAnswer2">
                <View v-if="visibility.securityAnswer2" />
                <Hide v-else />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-descriptions-item>

      <el-descriptions-item v-else label="安全答案2">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <!-- 安全问题3 -->
      <el-descriptions-item v-if="props.row.securityQuestion3" label="安全问题3">
        <template v-if="!isSecurityQuestion3Decrypted">
          <el-tooltip content="点击解密" placement="bottom">
            <span class="clickable-text" @click="handleDecryptSecurityQuestion3">
              {{ securityQuestion3 }}
            </span>
          </el-tooltip>
        </template>
        <template v-else>
          <div class="decrypted-field">
            <el-tooltip v-if="visibility.securityQuestion3" content="点击复制" placement="bottom">
              <span class="clickable-text" @click="handleCopy(securityQuestion3)">
                {{ securityQuestion3 }}
              </span>
            </el-tooltip>
            <span v-else class="clickable-text blur-text" @click="visibility.securityQuestion3 = true">
              {{ securityQuestion3 }}
            </span>
            <el-tooltip :content="visibility.securityQuestion3 ? '点击隐藏' : '点击显示'" placement="bottom">
              <el-icon class="eye-icon" @click.stop="visibility.securityQuestion3 = !visibility.securityQuestion3">
                <View v-if="visibility.securityQuestion3" />
                <Hide v-else />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-descriptions-item>

      <el-descriptions-item v-else label="安全问题3">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>

      <!-- 安全答案3 -->
      <el-descriptions-item v-if="props.row.securityAnswer3" label="安全答案3">
        <template v-if="!isSecurityAnswer3Decrypted">
          <el-tooltip content="点击解密" placement="bottom">
            <span class="clickable-text" @click="handleDecryptSecurityAnswer3">
              {{ securityAnswer3 }}
            </span>
          </el-tooltip>
        </template>
        <template v-else>
          <div class="decrypted-field">
            <el-tooltip v-if="visibility.securityAnswer3" content="点击复制" placement="bottom">
              <span class="clickable-text" @click="handleCopy(securityAnswer3)">
                {{ securityAnswer3 }}
              </span>
            </el-tooltip>
            <span v-else class="clickable-text blur-text" @click="visibility.securityAnswer3 = true">
              {{ securityAnswer3 }}
            </span>
            <el-tooltip :content="visibility.securityAnswer3 ? '点击隐藏' : '点击显示'" placement="bottom">
              <el-icon class="eye-icon" @click.stop="visibility.securityAnswer3 = !visibility.securityAnswer3">
                <View v-if="visibility.securityAnswer3" />
                <Hide v-else />
              </el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-descriptions-item>

      <el-descriptions-item v-else label="安全答案3">
        <span class="not-set-yet"> 暂未设置 </span>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<style lang="scss" scoped>
.expand-detail-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px 20px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.02);
}

:deep(.el-descriptions) {
  padding: 0 0 8px 0;
  border-radius: 10px;
  overflow: hidden;
  border-color: #f0f1f3;
}

.descriptions-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.descriptions-title {
  display: flex;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;

  .title-icon {
    font-size: 18px;
    margin-top: 4px;
    color: #2563eb;
  }
}

.header-actions {
  display: flex;
  gap: 8px;
}

:deep(.el-descriptions__header) {
  margin-bottom: 12px;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  background: #fafbfc;
  padding: 10px 14px;
}

:deep(.el-descriptions__content) {
  padding: 10px 14px;
  word-break: break-all;
  font-size: 14px;
}

span {
  word-break: break-all;
  white-space: normal;
}

.clickable-text {
  cursor: pointer;
  border-bottom: 1.5px dashed #d1d5db;
  padding-bottom: 2px;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.clickable-text:hover {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

:deep(.green-content) {
  background: #f0fdf4 !important;
}

:deep(.red-content) {
  background: #fef2f2 !important;
}

.not-set-yet {
  color: #c4c6cc;
  font-style: italic;
}

.decrypted-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
}

.blur-text {
  filter: blur(5px);
  user-select: none;
  transition: filter 0.25s ease;
}

.eye-icon {
  cursor: pointer;
  flex-shrink: 0;
  font-size: 16px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition: color 0.2s;
  margin-left: auto;
  padding: 4px;
  border-radius: 6px;

  &:hover {
    color: #2563eb;
  }
}

.break-text {
  word-break: break-all;
}

.btn-edit {
  --el-button-border-color: #3b82f6;
  --el-button-text-color: #2563eb;
  --el-button-bg-color: rgba(59, 130, 246, 0.1);
  --el-button-hover-border-color: #2563eb;
  --el-button-hover-text-color: #1d4ed8;
  --el-button-hover-bg-color: rgba(59, 130, 246, 0.18);
  border-width: 1.5px;
  font-weight: 600;
}

.btn-delete {
  --el-button-border-color: #f87171;
  --el-button-text-color: #dc2626;
  --el-button-bg-color: rgba(239, 68, 68, 0.1);
  --el-button-hover-border-color: #dc2626;
  --el-button-hover-text-color: #b91c1c;
  --el-button-hover-bg-color: rgba(239, 68, 68, 0.18);
  border-width: 1.5px;
  font-weight: 600;
}
</style>
