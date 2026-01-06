<script setup lang="ts">
import { addAccountApi, updateAccountApi } from '@/services/account'
import { useRsaStore } from '@/stores/modules/rsa'
import { useUserStore } from '@/stores/modules/user'
import type { AddAccountDTO, UpdateAccountDTO, AccountVO } from '@/types/account'
import { decrypt, encrypt, sign } from '@/utils/rsa'
import { addOrUpdateAccountRules } from '@/utils/rules'
import { ElMessage, type FormInstance } from 'element-plus'
import { computed, reactive, ref } from 'vue'

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
const rsaStore = useRsaStore()
const userStore = useUserStore()
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
    password: undefined,
    email: undefined,
    secEmail: undefined,
    phone: undefined,
    owner: undefined,
    notes: undefined,
    mfaProvider: undefined,
    recoveryCodes: undefined,
    securityQuestion1: undefined,
    securityAnswer1: undefined,
    securityQuestion2: undefined,
    securityAnswer2: undefined,
    securityQuestion3: undefined,
    securityAnswer3: undefined,
    createTime: undefined,
    updateTime: undefined
  })
}

// 定义需要加密/解密的敏感字段列表
const SENSITIVE_FIELDS = [
  'password',
  'recoveryCodes',
  'securityQuestion1',
  'securityAnswer1',
  'securityQuestion2',
  'securityAnswer2',
  'securityQuestion3',
  'securityAnswer3'
] as const

// 提取敏感字段的联合类型
type SensitiveFieldKey = (typeof SENSITIVE_FIELDS)[number]

/**
 * 批量解密工具函数
 * @param row 原始行数据
 * @param privateKey 私钥
 */
const decryptAccountData = (row: AccountVO, privateKey: string): AccountForm => {
  // 排除 createTime, updateTime，复制剩余属性
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createTime, updateTime, ...rest } = row
  // 创建一个浅拷贝对象用于处理
  const result = { ...rest } as AccountForm

  SENSITIVE_FIELDS.forEach((field: SensitiveFieldKey) => {
    // 只有当字段有值且是字符串时才解密
    const val = result[field]
    if (val && typeof val === 'string') {
      try {
        result[field] = decrypt(val, privateKey)
      } catch (e) {
        console.error(`解密 ${field} 失败`, e)
        // 解密失败保留原值或清空，视需求而定，这里保留原值以防误操作清空数据
      }
    }
  })
  return result
}

/**
 * 批量加密工具函数
 * @param form 表单数据
 * @param publicKey 公钥
 */
const encryptAccountData = <T extends AccountForm>(form: T, publicKey: string): T => {
  const dto = { ...form }

  SENSITIVE_FIELDS.forEach((field: SensitiveFieldKey) => {
    const val = dto[field]
    if (val && typeof val === 'string') {
      try {
        // 断言赋值，因为 encrypt 返回 string
        ;(dto[field] as string | undefined) = encrypt(val, publicKey)
      } catch (e) {
        console.error(`加密 ${field} 失败`, e)
      }
    }
  })
  return dto
}

const handleOpened = () => {
  resetForm()
  if (props.type === 'update' && props.row) {
    // 使用新函数替换原有的手动逐个解密逻辑
    const decryptedData = decryptAccountData(props.row, rsaStore.privateKeyPemContent)
    Object.assign(formData, decryptedData)
  }
}

const sqa1Required = computed<boolean>(() => Boolean(formData.securityQuestion1 || formData.securityAnswer1))
const sqa2Required = computed<boolean>(() => Boolean(formData.securityQuestion2 || formData.securityAnswer2))
const sqa3Required = computed<boolean>(() => Boolean(formData.securityQuestion3 || formData.securityAnswer3))

const loading = ref(false)
const handleConfirm = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    // 生成签名
    const signature = sign(userStore.user!.uid, rsaStore.privateKeyPemContent)

    if (props.type === 'add') {
      const dto = encryptAccountData(formData as AddAccountDTO, rsaStore.publicKeyPemContent)
      dto.signature = signature

      await addAccountApi(dto)
      ElMessage.success({ message: '新增成功', plain: true })
    } else {
      if (!formData.id) {
        ElMessage.error('缺少主键 id')
        loading.value = false
        return
      }

      const dto = encryptAccountData(formData as UpdateAccountDTO, rsaStore.publicKeyPemContent)
      dto.signature = signature

      await updateAccountApi(dto)
      ElMessage.success({ message: '更新成功', plain: true })
    }

    visible.value = false
    emits('success')
  } catch (e) {
    console.error(e)
    ElMessage.error({ message: props.type === 'add' ? '新增失败' : '删除失败', plain: true })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <el-dialog
      v-model="visible"
      :title="type === 'add' ? '新增' : '更新'"
      width="750"
      @opened="handleOpened"
      align-center
    >
      <el-form ref="formRef" :model="formData" :rules="addOrUpdateAccountRules">
        <el-form-item prop="url" label="url" required inline-message>
          <el-input v-model="formData.url" maxlength="500" show-word-limit />
        </el-form-item>

        <el-form-item prop="website" label="网站名称" required inline-message>
          <el-input v-model="formData.website" maxlength="64" show-word-limit />
        </el-form-item>

        <el-form-item prop="officialAccessUrl" label="发布页url" inline-message>
          <el-input v-model="formData.officialAccessUrl" maxlength="500" show-word-limit />
        </el-form-item>

        <el-form-item prop="username" label="用户名" required inline-message>
          <el-input v-model="formData.username" maxlength="64" show-word-limit />
        </el-form-item>

        <el-form-item prop="nickname" label="昵称" inline-message>
          <el-input v-model="formData.nickname" maxlength="64" show-word-limit />
        </el-form-item>

        <el-form-item prop="password" label="密码" required inline-message>
          <el-input v-model="formData.password" maxlength="64" show-word-limit />
        </el-form-item>

        <el-form-item prop="email" label="邮箱" inline-message>
          <el-input v-model="formData.email" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item prop="secEmail" label="第二邮箱" inline-message>
          <el-input v-model="formData.secEmail" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item prop="phone" label="手机号" inline-message>
          <el-input v-model="formData.phone" maxlength="20" show-word-limit />
        </el-form-item>

        <el-form-item prop="owner" label="拥有者" inline-message>
          <el-input v-model="formData.owner" maxlength="30" show-word-limit />
        </el-form-item>

        <el-form-item prop="notes" label="备注" inline-message>
          <el-input v-model="formData.notes" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item prop="mfaProvider" label="二次验证服务商" inline-message>
          <el-input v-model="formData.mfaProvider" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item prop="recoveryCodes" label="恢复代码" inline-message>
          <el-input v-model="formData.recoveryCodes" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item prop="securityQuestion1" label="安全问题1" :required="sqa1Required" inline-message>
          <el-input v-model="formData.securityQuestion1" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item prop="securityAnswer1" label="安全答案1" :required="sqa1Required" inline-message>
          <el-input v-model="formData.securityAnswer1" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item prop="securityQuestion2" label="安全问题2" :required="sqa2Required" inline-message>
          <el-input v-model="formData.securityQuestion2" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item prop="securityAnswer2" label="安全答案2" :required="sqa2Required" inline-message>
          <el-input v-model="formData.securityAnswer2" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item prop="securityQuestion3" label="安全问题3" :required="sqa3Required" inline-message>
          <el-input v-model="formData.securityQuestion3" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item prop="securityAnswer3" label="安全答案3" :required="sqa3Required" inline-message>
          <el-input v-model="formData.securityAnswer3" maxlength="50" show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm"> 提交 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
