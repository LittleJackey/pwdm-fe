<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { encodePassword, isLogin, loginByPassword } from '@/services/user'

const form = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  await loginByPassword(form.username, encodePassword(form.password))
  ElMessage.success('登录成功')
}

const testLogin = async () => {
  const res = await isLogin()
  if (res.msg === 'true') {
    ElMessage.success('是')
  } else {
    ElMessage.error('否')
  }
}
</script>

<template>
  <div class="login-page">
    <h2>登录</h2>
    <el-form v-model="form" @submit.prevent="handleLogin">
      <el-form-item>
        <el-input v-model="form.username" placeholder="用户名" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.password" type="password" placeholder="密码" />
      </el-form-item>
      <el-button native-type="submit" type="primary" class="w-100">登录</el-button>
    </el-form>
    <el-button @click="testLogin">查询登录状态</el-button>
  </div>
</template>

<style lang="scss" scoped></style>
