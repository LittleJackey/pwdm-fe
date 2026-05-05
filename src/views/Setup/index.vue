<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useVaultStore } from '@/stores/modules/vault'
import { setupKeystoreApi } from '@/services/keystore'
import { useRouter } from 'vue-router'

const pin = ref('')
const loading = ref(false)
const vaultStore = useVaultStore()
const router = useRouter()

const handleSetup = async () => {
  if (!pin.value) {
    ElMessage.error({ message: '请输入PIN', plain: true })
    return
  }

  loading.value = true
  try {
    await vaultStore.setupVaultWithKeyFile(pin.value)

    const kdfConfig = vaultStore.kdfConfig
    if (!kdfConfig) {
      throw new Error('KDF 配置生成失败')
    }

    await setupKeystoreApi({
      salt: kdfConfig.salt,
      kdfAlgo: 'argon2id',
      kdfParams: JSON.stringify({
        iterations: kdfConfig.iterations,
        memory: kdfConfig.memory,
        parallelism: kdfConfig.parallelism
      }),
      verifyIv: vaultStore.verifyIv || '',
      verifyCiphertext: vaultStore.verifyCiphertext || ''
    })

    ElMessage.success({ message: '密码库初始化成功', plain: true })
    router.replace('/home')
  } catch (error: unknown) {
    ElMessage.error({ message: error instanceof Error ? error.message : '初始化失败', plain: true })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="setup-container">
    <div class="setup-card">
      <div class="setup-header">
        <h1 class="title">初始化密码库</h1>
        <p class="subtitle">设置 PIN 并下载密钥文件，用于加密保护您的账户数据</p>
      </div>

      <el-form @submit.prevent="handleSetup" size="large">
        <el-form-item label="PIN" required>
          <el-input v-model="pin" type="password" placeholder="请设置一个易记的 PIN" show-password />
        </el-form-item>

        <div class="warning-box">
          <p>设置后将自动下载 <strong>.pmk</strong> 密钥文件。</p>
          <p>请务必妥善保管此文件和您的 PIN，丢失后将<strong>无法恢复</strong>数据。</p>
        </div>

        <el-button :loading="loading" native-type="submit" type="primary" class="submit-btn">初始化密码库</el-button>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.setup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.setup-card {
  width: 100%;
  max-width: 440px;
  padding: 40px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);

  .setup-header {
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
      line-height: 1.6;
    }
  }
}

.warning-box {
  background: var(--el-color-warning-light-9);
  border: 1px solid var(--el-color-warning-light-7);
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 20px;

  p {
    margin: 0;
    font-size: 13px;
    color: var(--el-color-warning-dark-2);
    line-height: 1.8;
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}
</style>
