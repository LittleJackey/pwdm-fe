<script setup lang="ts">
import { useVaultStore } from '@/stores/modules/vault'
import { ElForm, ElMessage, type UploadFile, type UploadInstance } from 'element-plus'
import { computed, ref } from 'vue'

const props = defineProps<{
  // 是否显示对话框
  modelValue: boolean
}>()

// 标题
const title = '解锁'
// 主提示信息
const message = '需要 PIN 和 秘钥文件'

const emits = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set(v) {
    emits('update:modelValue', v)
  }
})

const showPinInput = ref(false)
const pin = ref('')
const vaultStore = useVaultStore()

// 解锁主密码中
const unlocking = ref(false)
const handleUnlock = async () => {
  // 校验 PIN 和 秘钥文件已输入
  if (!pin.value) {
    ElMessage.error({ message: '请输入PIN', plain: true })
    return
  }

  // 获取原生 File 对象
  const rawFile = fileList.value[0]?.raw
  if (!rawFile) {
    ElMessage.error({ message: '秘钥文件无效，请重新选择', plain: true })
    return
  }

  unlocking.value = true

  try {
    await vaultStore.unlock(pin.value, rawFile) // 传入 pin 和 File 对象
    console.log('解锁成功')
    console.log(' vaultStore.isUnlocked = ', vaultStore.isUnlocked)
    ElMessage.success({ message: '解锁成功', plain: true })
    handleClose()
    // eslint-disable-next-line
  } catch (error: any) {
    ElMessage.error({ message: error.message || '解锁失败', plain: true })
  } finally {
    unlocking.value = false
  }
}

const uploadRef = ref<UploadInstance>()
// 本地维护的上传文件列表
const fileList = ref<UploadFile[]>([])

const handleFileChange = (_uploadFile: UploadFile, uploadFiles: UploadFile[]) => {
  const latestFile = uploadFiles[uploadFiles.length - 1]
  const rawFile = latestFile?.raw
  if (!rawFile) {
    ElMessage.error({ message: '文件无效，请重新选择', plain: true })
    return
  }

  if (!rawFile.name.endsWith('.pmk')) {
    ElMessage.error({ message: '请上传 .pmk 格式的文件', plain: true })
    uploadRef.value?.clearFiles()
    return
  }

  // 始终只保留最新文件，新文件替换旧文件
  fileList.value = [latestFile]
}

const handleFileRemove = () => {
  fileList.value = []
}

const handleClose = () => {
  showPinInput.value = false
  pin.value = ''
  handleFileRemove()
  visible.value = false
}
</script>

<template>
  <el-dialog v-model="visible" width="480px" :title="title" @close="handleClose">
    <div class="decrypt-dialog">
      <div class="hint-row">
        <el-icon class="hint-icon"><InfoFilled /></el-icon>
        <span class="hint-text">{{ message }}</span>
      </div>

      <el-form class="pin-form" @submit.prevent="handleUnlock">
        <el-form-item required label="PIN">
          <el-input placeholder="请输入 PIN" v-model="pin" />
        </el-form-item>
      </el-form>

      <el-upload
        v-model:file-list="fileList"
        ref="uploadRef"
        class="key-upload"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        accept=".pmk"
      >
        <Transition name="upload-switch" mode="out-in">
          <div v-if="fileList.length === 0" key="idle">
            <el-icon class="upload-icon"><UploadFilled /></el-icon>
            <div class="upload-text">拖拽密钥文件到此或 <em>点击上传</em></div>
          </div>
          <div v-else key="done" class="upload-done">
            <el-icon class="done-icon"><CircleCheckFilled /></el-icon>
            <div class="done-text">拖拽密钥文件到此或<em>点击替换</em></div>
          </div>
        </Transition>
        <template #tip>
          <Transition name="tip-switch" mode="out-in">
            <div v-if="fileList.length === 0" key="tip-idle" class="upload-tip">仅支持 .pmk 格式</div>
            <div v-else key="tip-done" class="upload-tip">当前秘钥文件：</div>
          </Transition>
        </template>
      </el-upload>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleUnlock" :loading="unlocking">解锁</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.decrypt-dialog {
  padding: 4px 0;
}

.hint-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  padding: 14px 18px;
  background: var(--el-color-primary-light-9);
  border-radius: 10px;
  border: 1px solid var(--el-color-primary-light-8);
  line-height: 1.6;
}

.hint-icon {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--el-color-primary);
}

.hint-text {
  font-size: 15px;
  color: var(--el-text-color-regular);
}

.pin-form {
  margin-bottom: 20px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
    background: var(--el-fill-color-blank);
    transition:
      box-shadow 0.2s,
      background 0.2s;

    &:hover {
      background: var(--el-color-white);
      box-shadow: 0 0 0 1px var(--el-border-color-dark) inset;
    }

    &.is-focus {
      background: var(--el-color-white);
      box-shadow: 0 0 0 1.5px var(--el-color-primary) inset;
    }
  }
}

.key-upload {
  :deep(.el-upload-dragger) {
    padding: 36px 24px;
    border-radius: 12px;
    border: 2px dashed var(--el-border-color);
    background: var(--el-fill-color-blank);
    transition:
      border-color 0.2s,
      background 0.2s;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      background: var(--el-color-primary-light-9);
    }
  }
}

.upload-icon {
  font-size: 32px;
  color: var(--el-color-primary-light-3);
}

.upload-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-top: 12px;

  em {
    color: var(--el-color-primary);
    font-style: normal;
  }
}

.upload-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.upload-done {
  text-align: center;
}

.done-icon {
  font-size: 32px;
  color: var(--el-color-success);
}

.done-text {
  font-size: 14px;
  color: var(--el-color-info);
  margin-top: 12px;

  em {
    color: var(--el-color-primary);
    font-style: normal;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-switch-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.upload-switch-leave-active {
  transition: opacity 0.1s ease;
}

.upload-switch-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.upload-switch-leave-to {
  opacity: 0;
}

.tip-switch-enter-active,
.tip-switch-leave-active {
  transition: opacity 0.2s ease;
}

.tip-switch-enter-from,
.tip-switch-leave-to {
  opacity: 0;
}
</style>
