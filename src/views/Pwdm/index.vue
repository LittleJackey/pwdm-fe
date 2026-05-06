<script setup lang="ts">
import { accountPageQueryApi, deleteAccountApi, deleteBatchAccountApi } from '@/services/account'
import type { AccountPageQueryDTO, AccountVO } from '@/types/account'
import { fillPaginationParams, fillSortParams } from '@/utils/common'
import { dayjs, ElMessage, ElMessageBox, type FormInstance, type Sort } from 'element-plus'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import AccountFormModal from './components/AccountFormModal.vue'
import AccountDescription from './components/AccountDescription.vue'
import DecryptKeyDialog from './components/DecryptKeyDialog.vue'
import { useVaultStore } from '@/stores/modules/vault'

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
  if (await checkAndRequestMasterKey()) {
    // 用户操作成功，继续执行
    opType.value = type
    opRow.value = row
    modalVisible.value = true
  }
}

const vaultStore = useVaultStore()
const checkAndRequestMasterKey = async () => {
  if (!vaultStore.isUnlocked) {
    masterKeyDialogVisible.value = true

    // 等待用户操作完成
    const success = await waitForUserAction()

    // 如果用户取消或失败，直接返回
    if (!success) {
      return false
    }
  }
  return vaultStore.isUnlocked
}

// 创建一个 Promise 来等待用户操作
const waitForUserAction = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // 监听对话框的关闭事件
    const unwatch = watch(
      () => masterKeyDialogVisible.value,
      (visible) => {
        if (!visible) {
          // 对话框关闭后，检查私钥是否正确
          if (vaultStore.isUnlocked) {
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
  if (await checkAndRequestMasterKey()) {
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
  if (await checkAndRequestMasterKey()) {
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

const masterKeyDialogVisible = ref(false)

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

const handleUnlock = () => {
  masterKeyDialogVisible.value = true
}
const handleLock = async () => {
  await vaultStore.lock()
  ElMessage.success({ message: '锁定成功', plain: true })
}

onMounted(() => {
  getAccountPageList()
})
</script>

<template>
  <div class="pwdm-page">
    <div class="search-card">
      <el-form ref="searchFormRef" :model="accountPageQueryForm">
        <div class="search-fields">
          <el-form-item label="网站名" prop="website">
            <el-input
              v-model="accountPageQueryForm.website"
              placeholder="请输入网站名"
              clearable
              style="width: 200px"
              @keyup.enter="onSearch"
              @clear="onSearch"
            />
          </el-form-item>
          <el-form-item label="url" prop="url">
            <el-input
              v-model="accountPageQueryForm.url"
              placeholder="请输入网站url"
              clearable
              style="width: 300px"
              @keyup.enter="onSearch"
              @clear="onSearch"
            />
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="accountPageQueryForm.username"
              placeholder="请输入用户名"
              clearable
              style="width: 200px"
              @keyup.enter="onSearch"
              @clear="onSearch"
            />
          </el-form-item>
          <el-form-item label="手机" prop="phone">
            <el-input
              v-model="accountPageQueryForm.phone"
              placeholder="请输入手机"
              clearable
              style="width: 200px"
              @keyup.enter="onSearch"
              @clear="onSearch"
            />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="accountPageQueryForm.email"
              placeholder="请输入邮箱"
              clearable
              style="width: 200px"
              @keyup.enter="onSearch"
              @clear="onSearch"
            />
          </el-form-item>
          <el-form-item label="备注" prop="notes">
            <el-input
              v-model="accountPageQueryForm.notes"
              placeholder="请输入备注"
              clearable
              style="width: 200px"
              @keyup.enter="onSearch"
              @clear="onSearch"
            />
          </el-form-item>
        </div>

        <div class="search-toggle">
          <el-button type="primary" link @click="showAdvanced = !showAdvanced">
            {{ showAdvanced ? '收起筛选' : '更多筛选' }}
            <el-icon>
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
          <div v-show="showAdvanced" class="advanced-search-wrap">
            <div class="advanced-search">
              <el-form-item label="昵称" prop="nickname">
                <el-input
                  v-model="accountPageQueryForm.nickname"
                  placeholder="请输入昵称"
                  clearable
                  style="width: 200px"
                  @keyup.enter="onSearch"
                  @clear="onSearch"
                />
              </el-form-item>
              <el-form-item label="账号拥有者" prop="owner">
                <el-input
                  v-model="accountPageQueryForm.owner"
                  placeholder="请输入账号拥有者"
                  clearable
                  style="width: 200px"
                  @keyup.enter="onSearch"
                  @clear="onSearch"
                />
              </el-form-item>
              <el-form-item label="第二邮箱" prop="secEmail">
                <el-input
                  v-model="accountPageQueryForm.secEmail"
                  placeholder="请输入第二邮箱"
                  clearable
                  style="width: 200px"
                  @keyup.enter="onSearch"
                  @clear="onSearch"
                />
              </el-form-item>
              <el-form-item label="二次验证服务商" prop="mfaProvider">
                <el-input
                  v-model="accountPageQueryForm.mfaProvider"
                  placeholder="请输入二次验证服务商"
                  clearable
                  style="width: 200px"
                  @keyup.enter="onSearch"
                  @clear="onSearch"
                />
              </el-form-item>
              <el-form-item label="创建时间">
                <el-date-picker
                  v-model="createTimeRange"
                  style="width: 360px"
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
                  style="width: 360px"
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
          </div>
        </el-collapse-transition>

        <div class="search-actions">
          <el-button type="primary" :loading="pageLoading" @click="onSearch"> 搜索 </el-button>
          <el-button @click="resetForm(searchFormRef)"> 重置 </el-button>
        </div>
      </el-form>
    </div>
    <div class="table-card">
      <div class="action-bar">
        <div class="action-bar-left">
          <el-button v-if="vaultStore.isUnlocked" class="btn-lock" @click="handleLock"> 锁定主秘钥 </el-button>
          <el-button v-else class="btn-unlock" @click="handleUnlock"> 解锁主秘钥 </el-button>
          <el-button type="primary" @click="openDialog('add')"> 新增 </el-button>
          <el-button type="danger" :disabled="batchDeleteDisabled" @click="handleBatchDeleteAccount">
            批量删除
          </el-button>
        </div>
      </div>

      <el-table
        :data="dataList"
        stripe
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
              :check-and-request-master-key="checkAndRequestMasterKey"
              @edit="(row) => openDialog('update', row)"
              @delete="(id) => handleDeleteAccount(id, $index + 1)"
            />
          </template>
        </el-table-column>

        <el-table-column type="selection" min-width="55" />
        <el-table-column type="index" label="序号" min-width="80" />
        <el-table-column prop="website" label="网站名" min-width="120" />
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
        <el-table-column prop="updateTime" label="修改时间" min-width="180" sortable />
        <el-table-column fixed="right" label="操作" min-width="120">
          <template #default="{ row, $index }">
            <el-button type="primary" link @click="openDialog('update', row)" @success="getAccountPageList">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDeleteAccount(row.id, $index + 1)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper">
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
    </div>
    <account-form-modal v-model="modalVisible" :type="opType" :row="opRow" @success="getAccountPageList" />
    <decrypt-key-dialog v-model="masterKeyDialogVisible" />
  </div>
</template>

<style lang="scss" scoped>
.pwdm-page {
  background-color: #f7f8fa;
  min-height: 100%;
  padding: 20px;
}

.search-card,
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.03);
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.search-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.search-fields :deep(.el-form-item) {
  margin-right: 20px;
  margin-bottom: 0;
}

.search-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 0;
}

.advanced-search-wrap {
  overflow: hidden;
}

.advanced-search {
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  margin-bottom: 4px;
  display: flex;
  flex-wrap: wrap;
}

.advanced-search :deep(.el-form-item) {
  margin-right: 20px;
  margin-bottom: 4px;
}

.search-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.action-bar-left {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f1f3;
  margin-top: 16px;
}

/* --- El-table refinements --- */
:deep(.el-table) {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #fafbfc;

  border-radius: 8px;
  overflow: hidden;

  .el-table__header th {
    font-weight: 600;
    font-size: 13px;
    color: #6b7280;
    letter-spacing: 0.3px;
    border-bottom: 1px solid #f0f1f3;
  }

  .el-table__body td {
    border-bottom: 1px solid #f5f5f5;
  }

  .el-table__expand-icon {
    color: #909399;

    &.el-table__expand-icon--expanded {
      color: #303133;
    }
  }

  .el-table__expanded-cell {
    padding: 12px 24px 20px 24px !important;
    background: #fafbfc;
  }
}

/* --- El-pagination refinements --- */
:deep(.el-pagination) {
  .el-pager li {
    border-radius: 6px;
    font-weight: 500;
  }

  .btn-prev,
  .btn-next {
    border-radius: 6px;
  }
}

/* --- El-button refinements --- */
:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

/* --- Lock/unlock buttons --- */
.btn-lock {
  --el-button-border-color: #22c55e;
  --el-button-text-color: #16a34a;
  --el-button-bg-color: rgba(34, 197, 94, 0.12);
  --el-button-hover-border-color: #16a34a;
  --el-button-hover-text-color: #15803d;
  --el-button-hover-bg-color: rgba(34, 197, 94, 0.2);
  border-width: 1.5px;
  font-weight: 600;
}

.btn-unlock {
  --el-button-border-color: #f59e0b;
  --el-button-text-color: #d97706;
  --el-button-bg-color: rgba(245, 158, 11, 0.12);
  --el-button-hover-border-color: #d97706;
  --el-button-hover-text-color: #b45309;
  --el-button-hover-bg-color: rgba(245, 158, 11, 0.2);
  border-width: 1.5px;
  font-weight: 600;
}
</style>
