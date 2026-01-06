<script setup lang="ts">
import { accountPageQueryApi, deleteAccountApi, deleteBatchAccountApi } from '@/services/account'
import type { AccountPageQueryDTO, AccountVO } from '@/types/account'
import { fillPaginationParams, fillSortParams } from '@/utils/common'
import {
  dayjs,
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type Sort,
  type UploadFile,
  type UploadInstance,
  type UploadUserFile
} from 'element-plus'
import { computed, onBeforeMount, onMounted, reactive, ref, watch } from 'vue'
import AccountFormModal from './components/AccountFormModal.vue'
import AccountDescription from './components/AccountDescription.vue'
import DecryptKeyDialog from './components/DecryptKeyDialog.vue'
import { useRsaStore } from '@/stores/modules/rsa'
import { useUserStore } from '@/stores/modules/user'
import { useRouter } from 'vue-router'

const searchFormRef = ref<FormInstance>()
const dataList = ref<AccountVO[]>([])
const pageLoading = ref(true)
const sortState = ref<Sort | null>(null)

const pagination = {
  total: 0,
  currentPage: 1,
  pageSize: 10,
  background: true
}

const accountPageQueryForm = reactive<AccountPageQueryDTO>({
  pageNum: pagination.currentPage,
  pageSize: pagination.pageSize,
  orderColumn: '',
  orderDirection: 'ascending',
  website: '',
  url: '',
  officialAccessUrl: '',
  username: '',
  nickname: '',
  email: '',
  secEmail: '',
  phone: '',
  owner: '',
  notes: '',
  mfaProvider: '',
  createTimeStart: undefined,
  createTimeEnd: undefined,
  updateTimeStart: undefined,
  updateTimeEnd: undefined
})

const onSortChanged = (sort: Sort) => {
  sortState.value = sort
  onSearch()
}

const onSearch = async () => {
  if (!pageLoading.value) {
    // 直接重置分页并获取数据，不再操作排序
    pagination.currentPage = 1
    // 获取数据
    getAccountPageList()
  }
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  // 清空查询参数
  formEl.resetFields()
  // Form组件的resetFields方法无法清除datepicker里面的数据。
  accountPageQueryForm.createTimeEnd = undefined
  accountPageQueryForm.createTimeStart = undefined
  accountPageQueryForm.updateTimeStart = undefined
  accountPageQueryForm.updateTimeEnd = undefined
  // 重置分页并查询
  onSearch()
}

const createTimeRange = computed({
  get() {
    if (accountPageQueryForm.createTimeStart && accountPageQueryForm.createTimeEnd) {
      return [accountPageQueryForm.createTimeStart, accountPageQueryForm.createTimeEnd]
    } else {
      return null
    }
  },
  set(v: [string, string] | null) {
    if (v?.length === 2) {
      accountPageQueryForm.createTimeStart = v[0]
      accountPageQueryForm.createTimeEnd = v[1]
    } else {
      accountPageQueryForm.createTimeStart = undefined
      accountPageQueryForm.createTimeEnd = undefined
    }
  }
})

const updateTimeRange = computed({
  get() {
    if (accountPageQueryForm.updateTimeStart && accountPageQueryForm.updateTimeEnd) {
      return [accountPageQueryForm.updateTimeStart, accountPageQueryForm.updateTimeEnd]
    } else {
      return null
    }
  },
  set(v: [string, string] | null) {
    if (v?.length === 2) {
      accountPageQueryForm.updateTimeStart = v[0]
      accountPageQueryForm.updateTimeEnd = v[1]
    } else {
      accountPageQueryForm.updateTimeStart = undefined
      accountPageQueryForm.updateTimeEnd = undefined
    }
  }
})

const shortcuts = [
  {
    text: '今天',
    value: () => {
      const start = dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss')
      const end = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      return [start, end]
    }
  },
  {
    text: '昨天',
    value: () => {
      const start = dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      const end = dayjs().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')
      return [start, end]
    }
  },
  {
    text: '最近一周',
    value: () => {
      const start = dayjs().subtract(6, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      const end = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const start = dayjs().subtract(29, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      const end = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      return [start, end]
    }
  },
  {
    text: '最近半年',
    value: () => {
      const start = dayjs().subtract(179, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      const end = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      return [start, end]
    }
  },
  {
    text: '最近一年',
    value: () => {
      const start = dayjs().subtract(364, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss')
      const end = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
      return [start, end]
    }
  }
]

const getAccountPageList = async () => {
  pageLoading.value = true
  // 只有当有排序时才填充排序参数
  if (sortState.value) {
    fillSortParams(accountPageQueryForm, sortState.value)
  }
  fillPaginationParams(accountPageQueryForm, pagination.currentPage, pagination.pageSize)

  try {
    const res = await accountPageQueryApi(accountPageQueryForm)
    dataList.value = res.data.records
    pagination.total = res.data.total
  } finally {
    pageLoading.value = false
  }
}

const opType = ref<'add' | 'update'>('add')
const modalVisible = ref(false)
const opRow = ref<AccountVO>()
const openDialog = async (type: 'add' | 'update', row?: AccountVO) => {
  if (await checkAndRequestRsaPrivateKey()) {
    // 用户操作成功，继续执行
    opType.value = type
    opRow.value = row
    modalVisible.value = true
  }
}

const checkAndRequestRsaPrivateKey = async () => {
  if (!rsaStore.isKeyValidAndMatched) {
    decryptKeyDialogTitle.value = '需要RSA私钥'
    decryptKeyDialogMessage.value = '该需要先传入RSA私钥'
    decryptKeyDialogVisible.value = true

    // 等待用户操作完成
    const success = await waitForUserAction()

    // 如果用户取消或失败，直接返回
    if (!success) {
      return false
    }
  }
  return true
}

// 创建一个 Promise 来等待用户操作
const waitForUserAction = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // 监听对话框的关闭事件
    const unwatch = watch(
      () => decryptKeyDialogVisible.value,
      (visible) => {
        if (!visible) {
          // 对话框关闭后，检查私钥是否正确
          if (rsaStore.isKeyValidAndMatched) {
            resolve(true) // 用户操作成功
          } else {
            resolve(false) // 用户取消或失败
          }
          unwatch() // 清理监听
        }
      },
      { immediate: true }
    )
  })
}

const handleDeleteAccount = async (id: number, index: number) => {
  if (await checkAndRequestRsaPrivateKey()) {
    ElMessageBox.confirm(`确认删除序号为${index}的记录吗?`, '提示', {
      type: 'warning'
    })
      .then(async () => {
        await deleteAccountApi(id)
        getAccountPageList()
        ElMessage.success({ message: '删除成功', plain: true })
      })
      .catch(() => {
        ElMessage.info({ message: '删除取消', plain: true })
      })
  }
}

const handleBatchDeleteAccount = async () => {
  if (await checkAndRequestRsaPrivateKey()) {
    // 或者直接使用
    const ids = multipleSelection.value.map((item) => item.id)

    ElMessageBox.confirm(`确认删除这些记录吗?`, '提示', {
      type: 'warning'
    })
      .then(async () => {
        await deleteBatchAccountApi(ids)
        getAccountPageList()
        ElMessage.success({ message: '删除成功', plain: true })
      })
      .catch(() => {
        ElMessage.info({ message: '删除取消', plain: true })
      })
  }
}

const multipleSelection = ref<AccountVO[]>([])

const handleSelectionChange = (val: AccountVO[]) => {
  multipleSelection.value = val
}

const batchDeleteDisabled = computed(() => {
  return multipleSelection.value.length <= 0
})

const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadUserFile[]>([])
const showUploader = ref(true) // 控制上传组件显隐

const afterManualSubmit = () => {
  if (rsaStore.isKeyValidAndMatched) {
    showUploader.value = false
    fileList.value = [{ name: '来自手动输入', url: '', uid: Date.now() }]
  }
}

const decryptKeyDialogVisible = ref(false)
const decryptKeyDialogTitle = ref('')
const decryptKeyDialogMessage = ref('')

const rsaStore = useRsaStore()

// 文件状态改变时的钩子（添加文件、上传成功/失败都会触发）
const handleFileChange = (uploadFile: UploadFile) => {
  // 1. 获取原生的 File 对象
  const rawFile = uploadFile.raw
  if (!rawFile) {
    return
  }

  // 2. 简单的校验
  if (!rawFile.name.endsWith('.pem')) {
    ElMessage.error('请上传 .pem 格式的文件')
    // 清理掉不符合的文件
    uploadRef.value?.clearFiles()
    return
  }

  // 3. 使用 FileReader 读取文件内容
  const reader = new FileReader()

  // 读取成功的回调
  reader.onload = (e) => {
    decryptKeyDialogVisible.value = false
    if (e.target?.result && typeof e.target.result === 'string') {
      // 成功获取字符串内容
      try {
        rsaStore.setPrivateKeyPemContent(e.target.result)
        fileList.value = [{ name: rawFile.name, url: '', uid: rawFile.uid }]
        showUploader.value = false // 隐藏上传组件
        ElMessage.success({ message: `${rawFile.name} 上传成功`, plain: true })
      } catch (e) {
        return ElMessage.error({ message: (e as Error).message || '无效的私钥', plain: true })
      }
    }
  }
  // 读取失败的回调
  reader.onerror = () => ElMessage.error({ message: '文件读取失败', plain: true })

  // 开始以文本形式读取
  // 因为这是一个异步的过程。代码的逻辑顺序必须是： 先告诉它“读完之后干什么”，然后再命令它“开始读”
  reader.readAsText(rawFile)
}

// 暴露给子组件的方法
const triggerUpload = () => {
  // 触发上传组件的点击事件
  uploadRef.value?.$el?.querySelector('.el-upload__input')?.click()
}

const handleRemoveFile = () => {
  rsaStore.clearPrivateKey()
  fileList.value = []
  showUploader.value = true // 显示上传组件
}

const showAdvanced = ref(false)

// 计算高级搜索区域已填写的条件数量
const advancedFilledCount = computed(() => {
  let count = 0

  // 检查每个高级搜索字段是否有值
  if (accountPageQueryForm.nickname?.trim()) count++
  if (accountPageQueryForm.owner?.trim()) count++
  if (accountPageQueryForm.secEmail?.trim()) count++
  if (accountPageQueryForm.mfaProvider?.trim()) count++
  if (accountPageQueryForm.createTimeStart || accountPageQueryForm.createTimeEnd) count++
  if (accountPageQueryForm.updateTimeStart || accountPageQueryForm.updateTimeEnd) count++

  return count
})

// 清空所有高级筛选条件
const clearAllAdvanced = () => {
  ElMessageBox.confirm('确定要清空所有高级筛选条件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      accountPageQueryForm.nickname = ''
      accountPageQueryForm.owner = ''
      accountPageQueryForm.secEmail = ''
      accountPageQueryForm.mfaProvider = ''
      accountPageQueryForm.createTimeStart = undefined
      accountPageQueryForm.createTimeEnd = undefined
      accountPageQueryForm.updateTimeStart = undefined
      accountPageQueryForm.updateTimeEnd = undefined
      onSearch()
      ElMessage.success('已清空高级筛选条件')
    })
    .catch(() => {
      // 用户取消
    })
}

// 清除创建时间
const clearCreateTime = () => {
  accountPageQueryForm.createTimeStart = undefined
  accountPageQueryForm.createTimeEnd = undefined
  onSearch()
}
// 清除修改时间
const clearUpdateTime = () => {
  accountPageQueryForm.updateTimeStart = undefined
  accountPageQueryForm.updateTimeEnd = undefined
  onSearch()
}
// 格式化日期范围显示
const formatDateRange = (start: string | undefined, end: string | undefined) => {
  if (!start && !end) return ''

  return `${dayjs(start).format('YYYY-MM-DD HH:mm')} ~ ${dayjs(end).format('YYYY-MM-DD HH:mm')}`
}

const userStore = useUserStore()
const router = useRouter()

onBeforeMount(() => {
  const userStore = useUserStore()
  if (!userStore.user?.isRsaGenerated) {
    ElMessageBox.confirm('请先设置RSA秘钥', '提示', {
      confirmButtonText: '去设置',
      type: 'error'
    })
      .then(() => {
        router.push('/home')
      })
      .catch(() => {
        router.push('/home')
      })
  }
})

onMounted(() => {
  getAccountPageList()
  rsaStore.publicKeyPemContent = userStore.user!.rsaPublicKey
})
</script>

<template>
  <div>
    <div>
      <el-form
        ref="searchFormRef"
        :inline="true"
        :model="accountPageQueryForm"
        class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
      >
        <el-form-item label="网站名" prop="website">
          <el-input
            v-model="accountPageQueryForm.website"
            placeholder="请输入网站名"
            clearable
            class="!w-[200px]"
            @change="onSearch"
          />
        </el-form-item>
        <el-form-item label="url" prop="url">
          <el-input
            v-model="accountPageQueryForm.url"
            placeholder="请输入网站url"
            clearable
            class="!w-[200px]"
            @change="onSearch"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="accountPageQueryForm.username"
            placeholder="请输入用户名"
            clearable
            class="!w-[200px]"
            @change="onSearch"
          />
        </el-form-item>

        <el-form-item label="手机" prop="phone">
          <el-input
            v-model="accountPageQueryForm.phone"
            placeholder="请输入手机"
            clearable
            class="!w-[200px]"
            @change="onSearch"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="accountPageQueryForm.email"
            placeholder="请输入邮箱"
            clearable
            class="!w-[200px]"
            @change="onSearch"
          />
        </el-form-item>

        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="accountPageQueryForm.notes"
            placeholder="请输入备注"
            clearable
            class="!w-[200px]"
            @change="onSearch"
          />
        </el-form-item>

        <div>
          <el-button type="primary" link @click="showAdvanced = !showAdvanced">
            {{ showAdvanced ? '收起' : '更多筛选' }}
            <el-badge
              v-if="advancedFilledCount > 0"
              :value="advancedFilledCount"
              :max="99"
              type="primary"
              class="ml-1"
            />
            <el-icon class="ml-1">
              <ArrowDown v-if="!showAdvanced" />
              <ArrowUp v-else />
            </el-icon>
          </el-button>
          <template v-if="!showAdvanced && advancedFilledCount > 0">
            <el-button type="primary" link size="small" @click="clearAllAdvanced"> 清空全部 </el-button>

            <el-tag
              v-if="accountPageQueryForm.nickname?.trim()"
              size="small"
              closable
              @close="
                () => {
                  accountPageQueryForm.nickname = ''
                  onSearch()
                }
              "
            >
              昵称: {{ accountPageQueryForm.nickname }}
            </el-tag>
            <el-tag
              v-if="accountPageQueryForm.owner?.trim()"
              size="small"
              closable
              @close="
                () => {
                  accountPageQueryForm.owner = ''
                  onSearch()
                }
              "
            >
              拥有者: {{ accountPageQueryForm.owner }}
            </el-tag>
            <el-tag
              v-if="accountPageQueryForm.secEmail?.trim()"
              size="small"
              closable
              @close="
                () => {
                  accountPageQueryForm.secEmail = ''
                  onSearch()
                }
              "
            >
              第二邮箱: {{ accountPageQueryForm.secEmail }}
            </el-tag>
            <el-tag
              v-if="accountPageQueryForm.mfaProvider?.trim()"
              size="small"
              closable
              @close="
                () => {
                  accountPageQueryForm.mfaProvider = ''
                  onSearch()
                }
              "
            >
              二次验证: {{ accountPageQueryForm.mfaProvider }}
            </el-tag>
            <el-tag
              v-if="accountPageQueryForm.createTimeStart || accountPageQueryForm.createTimeEnd"
              size="small"
              closable
              @close="clearCreateTime"
            >
              创建时间:
              {{ formatDateRange(accountPageQueryForm.createTimeStart, accountPageQueryForm.createTimeEnd) }}
            </el-tag>
            <el-tag
              v-if="accountPageQueryForm.updateTimeStart || accountPageQueryForm.updateTimeEnd"
              size="small"
              closable
              @close="clearUpdateTime"
            >
              修改时间:
              {{ formatDateRange(accountPageQueryForm.updateTimeStart, accountPageQueryForm.updateTimeEnd) }}
            </el-tag>
          </template>
        </div>

        <el-collapse-transition>
          <div v-show="showAdvanced" class="advanced-search">
            <el-form-item label="昵称" prop="nickname">
              <el-input
                v-model="accountPageQueryForm.nickname"
                placeholder="请输入昵称"
                clearable
                class="!w-[200px]"
                @change="onSearch"
              />
            </el-form-item>

            <el-form-item label="账号拥有者" prop="owner">
              <el-input
                v-model="accountPageQueryForm.owner"
                placeholder="请输入账号拥有者"
                clearable
                class="!w-[200px]"
                @change="onSearch"
              />
            </el-form-item>

            <el-form-item label="第二邮箱" prop="secEmail">
              <el-input
                v-model="accountPageQueryForm.secEmail"
                placeholder="请输入第二邮箱"
                clearable
                class="!w-[200px]"
                @change="onSearch"
              />
            </el-form-item>

            <el-form-item label="二次验证服务商" prop="mfaProvider">
              <el-input
                v-model="accountPageQueryForm.mfaProvider"
                placeholder="请输入二次验证服务商"
                clearable
                class="!w-[200px]"
                @change="onSearch"
              />
            </el-form-item>

            <el-form-item label="创建时间">
              <el-date-picker
                v-model="createTimeRange"
                class="!w-[360px]"
                format="YYYY-MM-DD HH:mm:ss"
                date-format="YYYY-MM-DD ddd"
                time-format="A hh:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetimerange"
                :shortcuts="shortcuts"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                @change="onSearch"
              />
            </el-form-item>
            <el-form-item label="修改时间">
              <el-date-picker
                v-model="updateTimeRange"
                class="!w-[360px]"
                format="YYYY-MM-DD HH:mm:ss"
                date-format="YYYY-MM-DD ddd"
                time-format="A hh:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetimerange"
                :shortcuts="shortcuts"
                range-separator="-"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                @change="onSearch"
              />
            </el-form-item>
          </div>
        </el-collapse-transition>

        <el-form-item>
          <el-button type="primary" :loading="pageLoading" @click="onSearch"> 搜索 </el-button>
          <el-button @click="resetForm(searchFormRef)"> 重置 </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <div>
        <el-button type="primary" @click="openDialog('add')"> 新增 </el-button>
        <el-button type="danger" :disabled="batchDeleteDisabled" @click="handleBatchDeleteAccount">
          批量删除
        </el-button>
      </div>
      <div>
        <div v-if="showUploader">
          <el-upload
            ref="uploadRef"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleRemoveFile"
            :show-file-list="false"
            accept=".pem"
            drag
            :limit="1"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">拖拽rsa私钥文件(.pem)到此或 <em>点击上传</em></div>
          </el-upload>
        </div>
        <div v-else>
          <el-tag closable @close="handleRemoveFile">
            {{ fileList[0]?.name }}
          </el-tag>
        </div>
      </div>
      <el-table
        :data="dataList"
        style="width: 100%"
        row-key="id"
        :loading="pageLoading"
        @sort-change="onSortChanged"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="expand">
          <template #default="{ row, $index }">
            <account-description
              :row="row"
              v-model:decrypt-key-dialog-visible="decryptKeyDialogVisible"
              v-model:decrypt-key-dialog-title="decryptKeyDialogTitle"
              v-model:decrypt-key-dialog-message="decryptKeyDialogMessage"
              @trigger-upload="triggerUpload"
              :on-remove="handleRemoveFile"
            />
            <el-button type="primary" @click="openDialog('update', row)"> 编辑 </el-button>
            <el-button type="danger" @click="handleDeleteAccount(row.id, $index + 1)"> 删除 </el-button>
          </template>
        </el-table-column>

        <el-table-column type="selection" min-width="55" />
        <el-table-column type="index" label="序号" min-width="80" />
        <el-table-column prop="website" label="网站" min-width="120" />
        <el-table-column prop="url" label="URL" show-overflow-tooltip min-width="220">
          <template #default="{ row }">
            <el-link type="primary" :href="row.url" target="_blank" underline="hover">
              {{ row.url }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="180" />
        <el-table-column prop="nickname" label="昵称" v-if="accountPageQueryForm.nickname !== ''" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="phone" label="手机号" v-if="accountPageQueryForm.phone !== ''" />
        <el-table-column prop="owner" label="拥有者" min-width="120" />
        <el-table-column prop="notes" label="备注" show-overflow-tooltip min-width="180" />
        <el-table-column prop="createTime" sortable label="创建时间" v-if="createTimeRange" min-width="180" />
        <el-table-column prop="updateTime" label="修改时间" min-width="180" />
        <el-table-column fixed="right" label="操作" min-width="120">
          <template #default="{ row, $index }">
            <el-button type="primary" link @click="openDialog('update', row)"> 编辑 </el-button>
            <el-button type="danger" link @click="handleDeleteAccount(row.id, $index + 1)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div>
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20]"
        layout="total,sizes, prev, pager, next"
        :total="pagination.total"
        @size-change="getAccountPageList"
        @current-change="getAccountPageList"
      />
    </div>
    <account-form-modal v-model="modalVisible" :type="opType" :row="opRow" @success="getAccountPageList" />
    <decrypt-key-dialog
      v-model="decryptKeyDialogVisible"
      :after-manual-submit="afterManualSubmit"
      :handle-upload="triggerUpload"
      :title="decryptKeyDialogTitle"
      :message="decryptKeyDialogMessage"
    />
  </div>
</template>

<style lang="scss" scoped></style>
