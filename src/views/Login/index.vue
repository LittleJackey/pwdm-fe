<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue' // 引入图标
import { encodePassword, getCaptchaImgApi, loginByPasswordApi } from '@/services/user'
import { useUserStore } from '@/stores/modules/user'
import { loginRules } from '@/utils/rules'
import { useRoute, useRouter } from 'vue-router'
import type { LoginDTO } from '@/types/user'

const loginFormRef = ref<FormInstance>()

const loginForm = reactive<LoginDTO>({
  username: '',
  password: '',
  captchaUuid: '',
  captchaCode: ''
})

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 默认为图片加载失败
const captchaImgBase64 = ref(
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+5Zu+54mH5Yqg6L295aSx6LSlPC90ZXh0Pjwvc3ZnPg=='
)
const captchaImgExpired = ref(false)
let captchaImgExpireTimer: number | null = null // 定时器句柄

// 获取/刷新验证码的方法
const refreshCaptchaImg = async () => {
  // 如果上一条定时器还在，先清掉
  if (captchaImgExpireTimer) {
    window.clearTimeout(captchaImgExpireTimer)
    captchaImgExpireTimer = null
  }

  const res = await getCaptchaImgApi()
  captchaImgBase64.value = res.data.base64
  loginForm.captchaUuid = res.data.uuid
  loginForm.captchaCode = '' // 刷新时清空输入框
  captchaImgExpired.value = false

  // 计算剩余毫秒数
  const expireAt = new Date(res.data.expired).getTime()
  const remain = expireAt - Date.now()

  if (remain > 0) {
    captchaImgExpireTimer = window.setTimeout(() => {
      captchaImgExpired.value = true
      captchaImgExpireTimer = null
    }, remain)
  } else {
    // 后端返回的时间已经过期，直接标成 true
    captchaImgExpired.value = true
  }
}

const loginLoading = ref(false)

const handleLogin = async () => {
  try {
    loginLoading.value = true
    await loginFormRef.value!.validate()

    const loginDto: LoginDTO = {
      ...loginForm,
      password: encodePassword(loginForm.password)
    }
    const res = await loginByPasswordApi(loginDto)
    userStore.setUser(res.data)
    ElMessage.success({ message: '登录成功', plain: true })
    // 如果有回跳地址就进行回跳，没有跳转到home
    router.replace((route.query.returnUrl as string) || '/home')
  } catch (fields) {
    console.log('校验失败', fields)
  } finally {
    loginLoading.value = false
  }
}

onMounted(() => {
  refreshCaptchaImg()
})

onBeforeUnmount(() => {
  if (captchaImgExpireTimer) {
    window.clearTimeout(captchaImgExpireTimer)
  }
})
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <img src="@/icons/ljic.png" alt="Logo" class="logo-img" />
          <h1 class="logo-text">Pwd Manager</h1>
        </div>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" @submit.prevent="handleLogin" size="large">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item prop="captchaCode">
          <div class="captcha-row">
            <el-input v-model="loginForm.captchaCode" placeholder="验证码" class="captcha-input" />

            <div class="captcha-box" @click="refreshCaptchaImg">
              <img v-if="captchaImgBase64" :src="captchaImgBase64" alt="验证码" />

              <div v-if="captchaImgExpired" class="captcha-mask">
                <span>已过期<br />点击刷新</span>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-button :loading="loginLoading" native-type="submit" type="primary" class="submit-btn"> 立即登录 </el-button>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  background-image: radial-gradient(#e0e4ec 1px, transparent 1px);
  background-size: 24px 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);

  .login-header {
    margin-bottom: 30px;

    // 2. Logo 区域样式优化
    .logo {
      display: flex;
      justify-content: center; /* 水平居中 */
      align-items: center; /* 垂直居中 */
      gap: 12px; /* 图片和文字之间的间距 */

      .logo-img {
        width: 40px; /* 限制 Logo 大小 */
        height: 40px;
        object-fit: contain;
      }

      .logo-text {
        margin: 0;
        font-size: 26px; /* 字体调大一点，突出品牌 */
        font-weight: 600;
        color: #2c3e50;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
    }
  }
}

.captcha-row {
  display: flex;
  width: 100%;
  gap: 12px;
  align-items: center;

  .captcha-input {
    flex: 1;
  }

  .captcha-box {
    position: relative;
    width: 100px; /* 根据你后端生成的实际宽度调整 */
    height: 40px;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #dcdfe6;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .captcha-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(2px);
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;

      span {
        font-size: 12px;
        color: grey;
        line-height: 1.2;
      }
    }
  }
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
  height: 44px;
  font-size: 16px;
  letter-spacing: 1px;
}
</style>
