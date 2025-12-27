<script setup lang="ts">
import { encodePassword, updateMyProfileApi } from '@/services/user'
import { useUserStore } from '@/stores/modules/user'
import type { UserUpdateDTO } from '@/types/user'
import { request } from '@/utils/request'
import { updateMyProfileRules } from '@/utils/rules'
import { ElMessage, type FormInstance } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const handleBack = () => {
  // 如果有回跳地址就进行回跳，没有跳转到首页
  router.replace((route.query.returnUrl as string) || '/home')
}

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const form = reactive<UserUpdateDTO>({
  username: userStore.user?.username || '',
  password: ''
})

const isModify = computed(() => {
  return form.username === userStore.user?.username && form.password === ''
})

const updateLoading = ref(false)

const handleUpdateMyProfile = async () => {
  try {
    updateLoading.value = true
    await formRef.value!.validate()

    const userUpdateDTO: UserUpdateDTO = {
      ...form,
      password: encodePassword(form.password)
    }
    await updateMyProfileApi(userUpdateDTO)
    ElMessage.success({ message: '修改成功', plain: true })
  } catch (fields) {
    console.log('校验失败', fields)
  } finally {
    updateLoading.value = false
  }
}

const handleClick = async () => {
  const res = await request('test/getA', 'GET')
  ElMessage.success(res.msg)
}
</script>

<template>
  <div class="user-info">
    <el-button @click="handleBack">返回</el-button>
    <div>
      <el-form
        ref="formRef"
        :model="form"
        label-position="top"
        :rules="updateMyProfileRules"
        @submit.prevent="handleUpdateMyProfile"
      >
        <el-form-item prop="username" label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-button native-type="submit" type="primary" :disabled="isModify" :loading="updateLoading">提交</el-button>
      </el-form>
      <el-button @click="handleClick">getA</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-info {
  width: 400px;
  margin: 100px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
