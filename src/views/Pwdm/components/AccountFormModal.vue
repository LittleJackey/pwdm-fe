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
const formData = reactive<Partial<AddAccountDTO & UpdateAccountDTO>>({})

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

const handleOpened = () => {
  // 每次打开重置
  resetForm()
  if (props.type === 'update' && props.row) {
    // 排除 createTime, updateTime 字段
    // eslint-disable-next-line
    const { createTime, updateTime, ...rest } = props.row
    Object.assign(formData, rest)

    formData.password = decrypt(formData.password!, rsaStore.privateKeyPemContent)

    if (formData.recoveryCodes) {
      formData.recoveryCodes = decrypt(formData.recoveryCodes, rsaStore.publicKeyPemContent)
    }

    if (formData.securityQuestion1 && formData.securityAnswer1) {
      formData.securityQuestion1 = encrypt(formData.securityQuestion1, rsaStore.publicKeyPemContent)
      formData.securityAnswer1 = encrypt(formData.securityAnswer1, rsaStore.publicKeyPemContent)
    }

    if (formData.securityQuestion2 && formData.securityAnswer2) {
      formData.securityQuestion2 = encrypt(formData.securityQuestion2, rsaStore.publicKeyPemContent)
      formData.securityAnswer2 = encrypt(formData.securityAnswer2, rsaStore.publicKeyPemContent)
    }

    if (formData.securityQuestion3 && formData.securityAnswer3) {
      formData.securityQuestion3 = encrypt(formData.securityQuestion3, rsaStore.publicKeyPemContent)
      formData.securityAnswer3 = encrypt(formData.securityAnswer3, rsaStore.publicKeyPemContent)
    }
  }
}

const sqa1Required = computed<boolean>(() => Boolean(formData.securityQuestion1 || formData.securityAnswer1))

const sqa2Required = computed<boolean>(() => Boolean(formData.securityQuestion2 || formData.securityAnswer2))

const sqa3Required = computed<boolean>(() => Boolean(formData.securityQuestion3 || formData.securityAnswer3))

const loading = ref(false)
const handleConfirm = async () => {
  if (!formRef.value) {
    return
  }

  loading.value = true
  const valid = await formRef.value.validate()
  if (!valid) {
    return
  }

  if (props.type === 'add') {
    const dto: AddAccountDTO = {
      ...(formData as AddAccountDTO)
    }

    encryptData(dto)

    await addAccountApi(dto)
    ElMessage.success({ message: '新增成功', plain: true })
    visible.value = false
    emits('success')
  } else {
    if (!formData.id) {
      ElMessage.error('缺少主键 id')
      return
    }

    const dto: UpdateAccountDTO = {
      ...(formData as UpdateAccountDTO)
    }

    encryptData(dto)

    await updateAccountApi(dto)
    ElMessage.success({ message: '更新成功', plain: true })
    visible.value = false
    emits('success')
  }
}

const encryptData = (dto: UpdateAccountDTO | AddAccountDTO) => {
  const signature = sign(userStore.user!.uid, rsaStore.privateKeyPemContent)

  dto.signature = signature

  dto.password = encrypt(formData.password!, rsaStore.publicKeyPemContent)

  if (formData.recoveryCodes) {
    dto.recoveryCodes = encrypt(formData.recoveryCodes!, rsaStore.publicKeyPemContent)
  }

  if (formData.securityQuestion1 && formData.securityAnswer1) {
    dto.securityQuestion1 = encrypt(formData.securityQuestion1!, rsaStore.publicKeyPemContent)
    dto.securityAnswer1 = encrypt(formData.securityAnswer1!, rsaStore.publicKeyPemContent)
  }

  if (formData.securityQuestion2 && formData.securityAnswer2) {
    dto.securityQuestion2 = encrypt(formData.securityQuestion2!, rsaStore.publicKeyPemContent)
    dto.securityAnswer2 = encrypt(formData.securityAnswer2!, rsaStore.publicKeyPemContent)
  }

  if (formData.securityQuestion3 && formData.securityAnswer3) {
    dto.securityQuestion3 = encrypt(formData.securityQuestion3!, rsaStore.publicKeyPemContent)
    dto.securityAnswer3 = encrypt(formData.securityAnswer3!, rsaStore.publicKeyPemContent)
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
