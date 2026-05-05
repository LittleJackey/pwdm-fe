<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { registerApi } from '@/services/user'
import { useUserStore } from '@/stores/modules/user'
import { registerRules } from '@/utils/rules'
import { useRouter } from 'vue-router'
import type { RegisterDTO } from '@/types/user'

const registerFormRef = ref<FormInstance>()
const router = useRouter()
const userStore = useUserStore()

const registerForm = reactive<RegisterDTO>({
  inviteCode: '',
  username: '',
  password: ''
})

const loading = ref(false)

const handleRegister = async () => {
  try {
    loading.value = true
    await registerFormRef.value!.validate()
    const res = await registerApi({ ...registerForm })
    userStore.setUser(res.data)
    ElMessage.success({ message: '注册成功', plain: true })
    router.replace('/home')
  } catch {
    // validation or API error handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1 class="title">创建账号</h1>
        <p class="subtitle">输入邀请码完成注册</p>
      </div>

      <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" @submit.prevent="handleRegister" size="large">
        <el-form-item prop="inviteCode">
          <el-input v-model="registerForm.inviteCode" placeholder="请输入邀请码" />
        </el-form-item>

        <el-form-item prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名（5-20个字符）" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>

        <el-button :loading="loading" native-type="submit" type="primary" class="submit-btn">注 册</el-button>

        <div class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  background-image: radial-gradient(#e0e4ec 1px, transparent 1px);
  background-size: 24px 24px;
}

.register-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);

  .register-header {
    text-align: center;
    margin-bottom: 30px;

    .title {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  letter-spacing: 1px;
}

.login-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #909399;

  a {
    color: var(--el-color-primary);
    text-decoration: none;
  }
}
</style>
