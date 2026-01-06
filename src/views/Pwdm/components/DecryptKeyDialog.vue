<script setup lang="ts">
import { useRsaStore } from '@/stores/modules/rsa'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    // 是否显示对话框
    modelValue: boolean
    // 标题
    title?: string
    // 主提示信息
    message?: string
    // 副提示信息
    subMessage?: string
    handleUpload: () => void
    afterManualSubmit: () => void
  }>(),
  {
    title: '需要密钥解密',
    message: '此内容已加密，需要密钥才能解密',
    subMessage: '请上传密钥文件或手动输入密钥内容'
  }
)

const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits('update:modelValue', v)
  }
})

const handleClose = () => {
  showManualInput.value = false
  manualKey.value = ''
  visible.value = false
}

const showManualInput = ref(false)
const manualKey = ref('')
const rsaStore = useRsaStore()
const handleManualSubmit = () => {
  try {
    rsaStore.setPrivateKeyPemContent(manualKey.value)
    handleClose()
    props.afterManualSubmit()
  } catch (e) {
    return ElMessage.error({ message: (e as Error).message || '无效的私钥', plain: true })
  }
}

const placeholderText = `请粘贴 RSA 私钥内容：
1. 确保包含完整的 PEM 格式标记
2. -----BEGIN PRIVATE KEY-----
              [您的私钥内容]
3. -----END PRIVATE KEY-----`
</script>

<template>
  <el-dialog v-model="visible" width="500px" :title="title" @close="handleClose">
    <!-- 内容区域 -->
    <div>
      <div>
        <el-icon>
          <Lock />
        </el-icon>
      </div>

      <div class="message-text">
        <p class="main-message">{{ message }}</p>
        <p class="sub-message">{{ subMessage }}</p>
      </div>

      <!-- 手动填写区域 -->
      <div v-if="showManualInput">
        <el-input v-model="manualKey" type="textarea" :rows="10" :placeholder="placeholderText" />
      </div>
    </div>

    <!-- 底部按钮区域 -->
    <template #footer>
      <div>
        <el-button type="primary" @click="props.handleUpload"> 上传 </el-button>
        <el-button type="success" v-if="!showManualInput" @click="showManualInput = true"> 手动填写 </el-button>
        <el-button type="success" v-else @click="handleManualSubmit"> 提交 </el-button>
        <el-button @click="handleClose"> 取消 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped></style>
