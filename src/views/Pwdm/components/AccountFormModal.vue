<script setup lang="ts">
import { addAccountApi, updateAccountApi } from '@/services/account'

import { useVaultStore } from '@/stores/modules/vault'
import type { AddAccountDTO, UpdateAccountDTO, AccountVO } from '@/types/account'
import type { EncryptedRecord } from '@/types/crypto'
import { addOrUpdateAccountRules } from '@/utils/rules'
import { ElMessage, type FormInstance } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import RandomPassword from '@/composable/RandomPassword.vue'

const props = defineProps<{
  type: 'add' | 'update'
  modelValue: boolean
  row?: AccountVO
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'success'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits('update:modelValue', v)
  }
})

const vaultStore = useVaultStore()
const formRef = ref<FormInstance>()
// 表单数据类型
type AccountForm = Partial<AddAccountDTO & UpdateAccountDTO>
const formData = reactive<AccountForm>({})

const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    website: undefined,
    url: undefined,
    officialAccessUrl: undefined,
    username: undefined,
    nickname: undefined,
    pwdIv: undefined,
    password: undefined,
    email: undefined,
    secEmail: undefined,
    phone: undefined,
    owner: undefined,
    notes: undefined,
    mfaProvider: undefined,
    recoveryCodes: undefined,
    sq1Iv: undefined,
    securityQuestion1: undefined,
    sa1Iv: undefined,
    securityAnswer1: undefined,
    sq2Iv: undefined,
    securityQuestion2: undefined,
    sa2Iv: undefined,
    securityAnswer2: undefined,
    sq3Iv: undefined,
    securityQuestion3: undefined,
    sa3Iv: undefined,
    securityAnswer3: undefined,
    createTime: undefined,
    updateTime: undefined
  })
}

const decryptAccountData = async (row: AccountVO): Promise<AccountForm> => {
  // 排除 createTime, updateTime，复制剩余属性
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createTime, updateTime, ...rest } = row
  // 创建一个浅拷贝对象用于处理
  const result = { ...rest } as AccountForm

  result.password = await decryptPassword(row)
  result.recoveryCodes = await decryptRecoveryCodes(row)
  result.securityQuestion1 = await decryptSecurityQuestion1(row)
  result.securityAnswer1 = await decryptSecurityAnswer1(row)
  result.securityQuestion2 = await decryptSecurityQuestion2(row)
  result.securityAnswer2 = await decryptSecurityAnswer2(row)
  result.securityQuestion3 = await decryptSecurityQuestion3(row)
  result.securityAnswer3 = await decryptSecurityAnswer3(row)

  return result
}

const decryptPassword = async (row: AccountVO) => {
  const pwdIv = row.pwdIv
  const password = row.password

  if (pwdIv && typeof pwdIv === 'string' && password && typeof password === 'string') {
    const encryptRecord: EncryptedRecord = { iv: pwdIv, ciphertext: password }

    try {
      const result = await vaultStore.readRecord(encryptRecord)
      return result
    } catch {
      ElMessage.error({ message: '字段【密码】解密失败', plain: true })
      return ''
    }
  }
}

const decryptRecoveryCodes = async (row: AccountVO) => {
  const recoveryCodesIv = row.recoveryCodesIv
  const recoveryCodes = row.recoveryCodes
  if (recoveryCodesIv && typeof recoveryCodesIv === 'string' && recoveryCodes && typeof recoveryCodes === 'string') {
    const encryptRecord: EncryptedRecord = { iv: recoveryCodesIv, ciphertext: recoveryCodes }

    try {
      const result = await vaultStore.readRecord(encryptRecord)
      return result
    } catch {
      ElMessage.error({ message: '字段【恢复代码】解密失败', plain: true })
      return ''
    }
  }
}

const decryptSecurityQuestion1 = async (row: AccountVO) => {
  const sq1Iv = row.sq1Iv
  const securityQuestion1 = row.securityQuestion1
  if (sq1Iv && typeof sq1Iv === 'string' && securityQuestion1 && typeof securityQuestion1 === 'string') {
    const encryptRecord: EncryptedRecord = { iv: sq1Iv, ciphertext: securityQuestion1 }

    try {
      const result = await vaultStore.readRecord(encryptRecord)
      return result
    } catch {
      ElMessage.error({ message: '字段【安全问题1】解密失败', plain: true })
      return ''
    }
  }
}

const decryptSecurityAnswer1 = async (row: AccountVO) => {
  const sa1Iv = row.sa1Iv
  const securityAnswer1 = row.securityAnswer1
  if (sa1Iv && typeof sa1Iv === 'string' && securityAnswer1 && typeof securityAnswer1 === 'string') {
    const encryptRecord: EncryptedRecord = { iv: sa1Iv, ciphertext: securityAnswer1 }

    try {
      const result = await vaultStore.readRecord(encryptRecord)
      return result
    } catch {
      ElMessage.error({ message: '字段【安全答案1】解密失败', plain: true })
      return ''
    }
  }
}

const decryptSecurityQuestion2 = async (row: AccountVO) => {
  const sq2Iv = row.sq2Iv
  const securityQuestion2 = row.securityQuestion2
  if (sq2Iv && typeof sq2Iv === 'string' && securityQuestion2 && typeof securityQuestion2 === 'string') {
    const encryptRecord: EncryptedRecord = { iv: sq2Iv, ciphertext: securityQuestion2 }

    try {
      const result = await vaultStore.readRecord(encryptRecord)
      return result
    } catch {
      ElMessage.error({ message: '字段【安全问题2】解密失败', plain: true })
      return ''
    }
  }
}

const decryptSecurityAnswer2 = async (row: AccountVO) => {
  const sa2Iv = row.sa2Iv
  const securityAnswer2 = row.securityAnswer2
  if (sa2Iv && typeof sa2Iv === 'string' && securityAnswer2 && typeof securityAnswer2 === 'string') {
    const encryptRecord: EncryptedRecord = { iv: sa2Iv, ciphertext: securityAnswer2 }

    try {
      const result = await vaultStore.readRecord(encryptRecord)
      return result
    } catch {
      ElMessage.error({ message: '字段【安全答案2】解密失败', plain: true })
      return ''
    }
  }
}

const decryptSecurityQuestion3 = async (row: AccountVO) => {
  const sq3Iv = row.sq3Iv
  const securityQuestion3 = row.securityQuestion3
  if (sq3Iv && typeof sq3Iv === 'string' && securityQuestion3 && typeof securityQuestion3 === 'string') {
    const encryptRecord: EncryptedRecord = { iv: sq3Iv, ciphertext: securityQuestion3 }

    try {
      const result = await vaultStore.readRecord(encryptRecord)
      return result
    } catch {
      ElMessage.error({ message: '字段【安全问题3】解密失败', plain: true })
      return ''
    }
  }
}

const decryptSecurityAnswer3 = async (row: AccountVO) => {
  const sa3Iv = row.sa3Iv
  const securityAnswer3 = row.securityAnswer3
  if (sa3Iv && typeof sa3Iv === 'string' && securityAnswer3 && typeof securityAnswer3 === 'string') {
    const encryptRecord: EncryptedRecord = { iv: sa3Iv, ciphertext: securityAnswer3 }

    try {
      const result = await vaultStore.readRecord(encryptRecord)
      return result
    } catch {
      ElMessage.error({ message: '字段【安全答案3】解密失败', plain: true })
      return ''
    }
  }
}

const encryptAccountData = async <T extends AccountForm>(form: T): Promise<T> => {
  const dto = { ...form }

  console.log('dto = ', dto)

  const {
    password,
    recoveryCodes,
    securityQuestion1,
    securityAnswer1,
    securityQuestion2,
    securityAnswer2,
    securityQuestion3,
    securityAnswer3
  } = { ...dto }

  if (password && typeof password === 'string') {
    try {
      const encryptRecord = await vaultStore.saveRecord(password)
      dto.password = encryptRecord.ciphertext
      dto.pwdIv = encryptRecord.iv
    } catch (e) {
      console.error('加密 password 失败', e)
      ElMessage.error({ message: '字段【密码】加密失败', plain: true })
      throw Error('加密 password 失败')
    }
  }

  if (recoveryCodes && typeof recoveryCodes === 'string') {
    console.log('加密recoveryCodes')
    try {
      const encryptRecord = await vaultStore.saveRecord(recoveryCodes)
      dto.recoveryCodes = encryptRecord.ciphertext
      dto.recoveryCodesIv = encryptRecord.iv
    } catch (e) {
      dto.recoveryCodes = ''
      dto.recoveryCodesIv = ''
      console.error(`加密 recoveryCodes 失败`, e)
      ElMessage.error({ message: '字段【恢复代码】加密失败', plain: true })
    }
  } else {
    dto.recoveryCodes = ''
    dto.recoveryCodesIv = ''
  }

  if (securityQuestion1 && typeof securityQuestion1 === 'string') {
    try {
      const encryptRecord = await vaultStore.saveRecord(securityQuestion1)
      dto.securityQuestion1 = encryptRecord.ciphertext
      dto.sq1Iv = encryptRecord.iv
    } catch (e) {
      dto.securityAnswer1 = ''
      dto.sa1Iv = ''
      console.error(`加密 securityQuestion1 失败`, e)
      ElMessage.error({ message: '字段【安全问题1】加密失败', plain: true })
    }
  } else {
    dto.securityQuestion1 = ''
    dto.sq1Iv = ''
  }

  if (securityAnswer1 && typeof securityAnswer1 === 'string') {
    try {
      const encryptRecord = await vaultStore.saveRecord(securityAnswer1)
      dto.securityAnswer1 = encryptRecord.ciphertext
      dto.sa1Iv = encryptRecord.iv
    } catch (e) {
      dto.securityAnswer1 = ''
      dto.sa1Iv = ''
      console.error(`加密 securityAnswer1 失败`, e)
      ElMessage.error({ message: '字段【安全答案1】加密失败', plain: true })
    }
  } else {
    dto.securityAnswer1 = ''
    dto.sa1Iv = ''
  }

  if (securityQuestion2 && typeof securityQuestion2 === 'string') {
    try {
      const encryptRecord = await vaultStore.saveRecord(securityQuestion2)
      dto.securityQuestion2 = encryptRecord.ciphertext
      dto.sq2Iv = encryptRecord.iv
    } catch (e) {
      dto.securityQuestion2 = ''
      dto.sq2Iv = ''
      console.error(`加密 securityQuestion2 失败`, e)
      ElMessage.error({ message: '字段【安全问题2】加密失败', plain: true })
    }
  } else {
    dto.securityQuestion2 = ''
    dto.sq2Iv = ''
  }

  if (securityAnswer2 && typeof securityAnswer2 === 'string') {
    try {
      const encryptRecord = await vaultStore.saveRecord(securityAnswer2)
      dto.securityAnswer2 = encryptRecord.ciphertext
      dto.sa2Iv = encryptRecord.iv
    } catch (e) {
      dto.securityAnswer2 = ''
      dto.sa2Iv = ''
      console.error(`加密 securityAnswer2 失败`, e)
      ElMessage.error({ message: '字段【安全答案2】加密失败', plain: true })
    }
  } else {
    dto.securityAnswer2 = ''
    dto.sa2Iv = ''
  }

  if (securityQuestion3 && typeof securityQuestion3 === 'string') {
    try {
      const encryptRecord = await vaultStore.saveRecord(securityQuestion3)
      dto.securityQuestion3 = encryptRecord.ciphertext
      dto.sq3Iv = encryptRecord.iv
    } catch (e) {
      dto.securityQuestion3 = ''
      dto.sq3Iv = ''
      console.error(`加密 securityQuestion3 失败`, e)
      ElMessage.error({ message: '字段【安全问题3】加密失败', plain: true })
    }
  } else {
    dto.securityQuestion3 = ''
    dto.sq3Iv = ''
  }

  if (securityAnswer3 && typeof securityAnswer3 === 'string') {
    try {
      const encryptRecord = await vaultStore.saveRecord(securityAnswer3)
      dto.securityAnswer3 = encryptRecord.ciphertext
      dto.sa3Iv = encryptRecord.iv
    } catch (e) {
      dto.securityAnswer3 = ''
      dto.sa3Iv = ''
      console.error(`加密 securityAnswer3 失败`, e)
      ElMessage.error({ message: '字段【安全答案3】加密失败', plain: true })
    }
  } else {
    dto.securityAnswer3 = ''
    dto.sa3Iv = ''
  }

  return dto
}

const handleOpened = async () => {
  resetForm()
  activeSections.value = ['credentials']
  if (props.type === 'update' && props.row) {
    console.log('props.row = ', props.row)
    const decryptedData = await decryptAccountData(props.row)
    Object.assign(formData, decryptedData)
    if (decryptedData.securityQuestion1 || decryptedData.securityQuestion2 || decryptedData.securityQuestion3) {
      activeSections.value.push('security')
    }
  }
}

const sqa1Required = computed<boolean>(() => Boolean(formData.securityQuestion1 || formData.securityAnswer1))
const sqa2Required = computed<boolean>(() => Boolean(formData.securityQuestion2 || formData.securityAnswer2))
const sqa3Required = computed<boolean>(() => Boolean(formData.securityQuestion3 || formData.securityAnswer3))

const submitLoading = ref(false)
const handleConfirm = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate()
  if (!valid) return

  submitLoading.value = true

  try {
    if (props.type === 'add') {
      const dto = await encryptAccountData(formData as AddAccountDTO)

      await addAccountApi(dto)
      ElMessage.success({ message: '新增成功', plain: true })
    } else {
      if (!formData.id) {
        ElMessage.error('缺少主键 id')
        submitLoading.value = false
        return
      }

      const dto = await encryptAccountData(formData as UpdateAccountDTO)

      await updateAccountApi(dto)
      ElMessage.success({ message: '更新成功', plain: true })
    }

    visible.value = false
    emits('success')
  } catch (e) {
    console.error(e)
    ElMessage.error({ message: props.type === 'add' ? '新增失败' : '更新失败', plain: true })
  } finally {
    submitLoading.value = false
  }
}

const activeSections = ref<string[]>(['credentials'])

const randomPasswordModalVisible = ref(false)
const handleRandomPasswordConfirm = (password: string) => {
  formData.password = password
}

const passwordInputStyle = computed(() => {
  const length = formData.password?.length ?? 0
  const map: Record<number, string> = { 2: '38%', 3: '50%', 4: '66.66%', 5: '83.33%' }
  console.log('length = ', length)
  let col = 2
  if (length <= 20) {
    col = 2
  } else if (length <= 32) {
    col = 3
  } else if (length <= 48) {
    col = 4
  } else {
    col = 5
  }

  return { width: map[col] }
})
</script>

<template>
  <div>
    <el-dialog
      v-model="visible"
      :title="type === 'add' ? '新增' : '编辑'"
      width="1000px"
      @opened="handleOpened"
      align-center
      class="account-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="addOrUpdateAccountRules" label-position="top">
        <div class="form-section">
          <div class="section-head">
            <span class="section-bar bar-blue"></span>
            <span class="section-title">基本信息</span>
          </div>

          <div class="form-grid">
            <el-form-item prop="url" label="站点 URL" required class="gc-6">
              <el-input
                v-model="formData.url"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 4 }"
                placeholder="请输入完整的站点地址..."
                maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item prop="website" label="网站名称" required class="gc-2">
              <el-input v-model="formData.website" placeholder="如: Google" maxlength="64" />
            </el-form-item>

            <el-form-item prop="username" label="用户名 / 账号" required class="gc-2">
              <el-input v-model="formData.username" placeholder="登录账号" maxlength="64" />
            </el-form-item>

            <el-form-item prop="nickname" label="昵称" class="gc-2">
              <el-input v-model="formData.nickname" placeholder="昵称" maxlength="64" />
            </el-form-item>

            <el-form-item prop="officialAccessUrl" label="官方发布页 / 备用入口" class="gc-6">
              <el-input
                v-model="formData.officialAccessUrl"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 2 }"
                placeholder="防止丢失的发布页地址"
                maxlength="500"
              />
            </el-form-item>
          </div>
        </div>

        <el-collapse v-model="activeSections" class="form-collapse">
          <el-collapse-item name="credentials">
            <template #title>
              <div class="section-head">
                <span class="section-bar bar-green"></span>
                <span class="section-title">凭证与联系方式</span>
              </div>
            </template>

            <div class="form-grid">
              <el-form-item prop="password" label="登录密码" required class="gc-6 password-field">
                <div :style="passwordInputStyle">
                  <el-input v-model="formData.password" maxlength="64" show-word-limit placeholder="请输入或生成密码">
                    <template #suffix>
                      <el-button type="primary" link @click="randomPasswordModalVisible = true">
                        <el-icon><Refresh /></el-icon>随机生成
                      </el-button>
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <el-form-item prop="email" label="邮箱" class="gc-3">
                <el-input v-model="formData.email" placeholder="primary@example.com" maxlength="100" />
              </el-form-item>

              <el-form-item prop="secEmail" label="第二邮箱" class="gc-3">
                <el-input v-model="formData.secEmail" placeholder="secondary@example.com" maxlength="100" />
              </el-form-item>

              <el-form-item prop="phone" label="手机号码" class="gc-2">
                <el-input v-model="formData.phone" maxlength="20" placeholder="请输入手机号码" />
              </el-form-item>

              <el-form-item prop="owner" label="账号拥有者" class="gc-2">
                <el-input v-model="formData.owner" maxlength="30" placeholder="请输入账号拥有者" />
              </el-form-item>

              <el-form-item prop="mfaProvider" label="二步验证 (MFA)" class="gc-6">
                <el-input v-model="formData.mfaProvider" placeholder="如: Google Authenticator" maxlength="50" />
              </el-form-item>

              <el-form-item prop="recoveryCodes" label="恢复代码" class="gc-6">
                <el-input
                  v-model="formData.recoveryCodes"
                  type="textarea"
                  show-word-limit
                  :autosize="{ minRows: 2, maxRows: 4 }"
                  placeholder="重要：请在此粘贴恢复码"
                  maxlength="256"
                />
              </el-form-item>

              <el-form-item prop="notes" label="备注信息" class="gc-6">
                <el-input
                  v-model="formData.notes"
                  type="textarea"
                  placeholder="关于此账号的说明..."
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </div>
          </el-collapse-item>

          <el-collapse-item name="security">
            <template #title>
              <div class="section-head">
                <span class="section-bar bar-amber"></span>
                <span class="section-title">安全密保 (Q&A)</span>
              </div>
            </template>

            <div class="form-grid">
              <el-form-item prop="securityQuestion1" label="安全问题 1" :required="sqa1Required" class="gc-3">
                <el-input
                  v-model="formData.securityQuestion1"
                  show-word-limit
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  placeholder="问题描述"
                  maxlength="50"
                />
              </el-form-item>
              <el-form-item prop="securityAnswer1" label="安全答案 1" :required="sqa1Required" class="gc-3">
                <el-input
                  v-model="formData.securityAnswer1"
                  show-word-limit
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  placeholder="密保答案"
                  maxlength="50"
                />
              </el-form-item>

              <el-form-item prop="securityQuestion2" label="安全问题 2" :required="sqa2Required" class="gc-3">
                <el-input
                  v-model="formData.securityQuestion2"
                  show-word-limit
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  placeholder="问题描述"
                  maxlength="50"
                />
              </el-form-item>
              <el-form-item prop="securityAnswer2" label="安全答案 2" :required="sqa2Required" class="gc-3">
                <el-input
                  v-model="formData.securityAnswer2"
                  show-word-limit
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  placeholder="密保答案"
                  maxlength="50"
                />
              </el-form-item>

              <el-form-item prop="securityQuestion3" label="安全问题 3" :required="sqa3Required" class="gc-3">
                <el-input
                  v-model="formData.securityQuestion3"
                  show-word-limit
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  placeholder="问题描述"
                  maxlength="50"
                />
              </el-form-item>
              <el-form-item prop="securityAnswer3" label="安全答案 3" :required="sqa3Required" class="gc-3">
                <el-input
                  v-model="formData.securityAnswer3"
                  show-word-limit
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 2 }"
                  placeholder="密保答案"
                  maxlength="50"
                />
              </el-form-item>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :loading="submitLoading">确认提交</el-button>
        </div>
      </template>
    </el-dialog>
    <random-password v-model="randomPasswordModalVisible" @confirm="handleRandomPasswordConfirm" />
  </div>
</template>

<style lang="scss" scoped>
/* 对话框 */
:deep(.account-dialog) {
  border-radius: 8px;

  .el-dialog__header {
    margin-right: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #ebeef5;

    .el-dialog__title {
      font-weight: 600;
      font-size: 17px;
      color: #303133;
    }
  }

  .el-dialog__body {
    max-height: 70vh;
    overflow-y: auto;
    padding: 20px 24px;
    background: #fff;
  }

  .el-dialog__footer {
    padding: 12px 24px 20px;
    background: #fff;
  }
}

/* 区块卡片 */
.form-section {
  background: #fff;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 16px;
}

/* 区块标题 */
.section-head {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}

.section-bar {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;

  &.bar-blue {
    background: #409eff;
  }
  &.bar-green {
    background: #67c23a;
  }
  &.bar-amber {
    background: #e6a23c;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 6 列栅格 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0 20px;
  align-items: start;
  width: 100%;
  box-sizing: border-box;
}

.gc-2 {
  grid-column: span 3;
}

.gc-3 {
  grid-column: span 3;
}

.gc-4 {
  grid-column: span 4;
}

.gc-5 {
  grid-column: span 5;
}

.gc-6 {
  grid-column: span 6;
}

/* 折叠面板 */
.form-collapse {
  border: none;
  background: transparent;

  :deep(.el-collapse-item) {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    margin-bottom: 16px;
    overflow: hidden;

    .el-collapse-item__header {
      padding: 0 20px;
      height: 50px;
      border-bottom: none;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s;

      &:hover {
        background: #f5f7fa;
      }

      &.is-active {
        border-bottom: 1px solid #ebeef5;
      }

      /* section-head 在折叠标题内时不需要底部间距 */
      .section-head {
        margin-bottom: 0;
      }
    }

    /* 折叠箭头 */
    .el-collapse-item__arrow {
      margin-left: auto;
      margin-right: 45px;
      font-size: 13px;
      color: #909399;
      transition: transform 0.2s;
    }

    .el-collapse-item__wrap {
      border-bottom: none;

      .el-collapse-item__content {
        padding: 16px 20px;
      }
    }
  }
}

/* 表单微调 */
:deep(.el-form-item) {
  margin-bottom: 16px;

  .el-form-item__label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
    padding-bottom: 4px;
  }
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 密码字段等宽字体 */
.password-field :deep(.el-input__inner) {
  font-family: ui-monospace, 'Cascadia Code', 'Fira Code', Consolas, monospace;
}
</style>
