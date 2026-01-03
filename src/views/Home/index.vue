<script setup lang="ts">
import { getRsaKeyPairPemApi, getUserInfoApi, storeRsaPublicKeyApi } from '@/services/user'
import { useUserStore } from '@/stores/modules/user'
import type { RsaKeyPairPemVO } from '@/types/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

const userStore = useUserStore()
const rsaKeyPairPem = reactive<RsaKeyPairPemVO>({
  uuid: '',
  publicKeyPemContent: '',
  privateKeyPemContent: ''
})

const getRsaKeyPairPemLoading = ref(false)
const handleGetRsaKeyPairPem = async () => {
  try {
    getRsaKeyPairPemLoading.value = true
    ElMessage.warning({ message: '此操作耗时较长, 请耐心等待', plain: true })
    const res = await getRsaKeyPairPemApi()
    rsaKeyPairPem.uuid = res.data.uuid
    rsaKeyPairPem.publicKeyPemContent = res.data.publicKeyPemContent
    rsaKeyPairPem.privateKeyPemContent = res.data.privateKeyPemContent
    ElMessage.success({ message: '获取成功', plain: true })
  } finally {
    getRsaKeyPairPemLoading.value = false
  }
}

const handleDownloadRsaPublicKeyPem = () => {
  const blob = new Blob([rsaKeyPairPem.publicKeyPemContent], { type: 'application/x-pem-file' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'rsa_public_key.pem'
  link.click()
  URL.revokeObjectURL(link.href)
}

const handleDownloadRsaPrivateKeyPem = () => {
  const blob = new Blob([rsaKeyPairPem.privateKeyPemContent], { type: 'application/x-pem-file' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'rsa_private_key.pem'
  link.click()
  URL.revokeObjectURL(link.href)
}

const storeRsaLoading = ref(false)
const handleStoreCurrentRsaKeyPair = async () => {
  ElMessageBox.confirm('请确保您已经保存了RSA私钥', '提示', {
    cancelButtonText: '下载私钥',
    confirmButtonText: '我已经保存',
    type: 'warning'
  })
    .then(async () => {
      try {
        storeRsaLoading.value = true

        if (rsaKeyPairPem.uuid === '') {
          return ElMessage.error({ message: '请先生成RSA密钥对', plain: true })
        }

        await storeRsaPublicKeyApi(rsaKeyPairPem.uuid)
        getUserInfo()
        ElMessage.success({ message: '成功', plain: true })
      } finally {
        storeRsaLoading.value = false
      }
    })
    .catch(() => {
      handleDownloadRsaPrivateKeyPem()
    })
}

const getUserInfo = async () => {
  const res = await getUserInfoApi()
  userStore.setUser(res.data)
}

onMounted(() => {
  getUserInfo()
})
</script>

<template>
  <div class="home-page">
    <h1>首页</h1>
    <div>
      <el-button
        @click="handleGetRsaKeyPairPem"
        type="primary"
        :loading="getRsaKeyPairPemLoading"
        :disabled="userStore.user?.isRsaGenerated"
      >
        获取RSA密钥对
      </el-button>

      <el-input
        :model-value="rsaKeyPairPem.publicKeyPemContent"
        style="width: 512px"
        :autosize="{ minRows: 2, maxRows: 20 }"
        type="textarea"
        placeholder="RSA 公钥"
      />
      <el-input
        :model-value="rsaKeyPairPem.privateKeyPemContent"
        style="width: 512px"
        :autosize="{ minRows: 2, maxRows: 20 }"
        type="textarea"
        placeholder="RSA 私钥"
      />
      <el-button
        @click="handleDownloadRsaPublicKeyPem"
        type="primary"
        :disabled="rsaKeyPairPem.publicKeyPemContent === ''"
        >下载公钥</el-button
      >
      <el-button
        @click="handleDownloadRsaPrivateKeyPem"
        type="primary"
        :disabled="rsaKeyPairPem.privateKeyPemContent === ''"
        >下载私钥</el-button
      >
      <el-button
        @click="handleStoreCurrentRsaKeyPair"
        type="primary"
        :disabled="userStore.user?.isRsaGenerated || rsaKeyPairPem.uuid === ''"
        >确定使用当前RSA密钥对</el-button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
