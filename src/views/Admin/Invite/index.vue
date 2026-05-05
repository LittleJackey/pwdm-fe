<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { generateInviteApi, getInviteListApi, revokeInviteApi } from '@/services/invite'
import type { InviteCodeVO } from '@/types/invite'

const list = ref<InviteCodeVO[]>([])
const total = ref(0)
const loading = ref(false)

const query = reactive({
  pageNum: 1,
  pageSize: 20,
  status: undefined as number | undefined
})

const dialogVisible = ref(false)
const generateLoading = ref(false)
const expiresAt = ref('')

const expireShortcuts = [
  { text: '1天后', value: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d } },
  { text: '7天后', value: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d } },
  { text: '30天后', value: () => { const d = new Date(); d.setDate(d.getDate() + 30); return d } },
  { text: '90天后', value: () => { const d = new Date(); d.setDate(d.getDate() + 90); return d } }
]

const statusMap: Record<number, { text: string; type: string }> = {
  0: { text: '未使用', type: 'success' },
  1: { text: '已使用', type: 'info' },
  2: { text: '已过期', type: 'danger' }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getInviteListApi({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      orderColumn: '',
      orderDirection: '',
      status: query.status
    })
    list.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

const openGenerateDialog = () => {
  expiresAt.value = ''
  dialogVisible.value = true
}

const handleGenerate = async () => {
  generateLoading.value = true
  try {
    const res = await generateInviteApi({
      expiresAt: expiresAt.value || undefined
    })
    const code = res.data
    await navigator.clipboard.writeText(code)
    ElMessage.success({ message: `邀请码已生成并复制: ${code}`, plain: true, duration: 5000 })
    dialogVisible.value = false
    fetchList()
  } finally {
    generateLoading.value = false
  }
}

const handleRevoke = async (id: number) => {
  try {
    await revokeInviteApi(id)
    ElMessage.success({ message: '已作废', plain: true })
    fetchList()
  } catch {
    // handled by interceptor
  }
}

const handleCopy = async (code: string) => {
  await navigator.clipboard.writeText(code)
  ElMessage.success({ message: '已复制', plain: true })
}

const handlePageChange = (page: number) => {
  query.pageNum = page
  fetchList()
}

const handleSizeChange = (size: number) => {
  query.pageSize = size
  fetchList()
}

onMounted(() => fetchList())
</script>

<template>
  <div class="invite-page">
    <div class="page-header">
      <h2>邀请码管理</h2>
      <el-button type="primary" :icon="Plus" @click="openGenerateDialog">
        生成邀请码
      </el-button>
    </div>

    <div class="filter-row">
      <el-select v-model="query.status" placeholder="状态筛选" clearable @change="fetchList" style="width: 140px">
        <el-option :value="0" label="未使用" />
        <el-option :value="1" label="已使用" />
        <el-option :value="2" label="已过期" />
      </el-select>
      <el-button :icon="Refresh" @click="fetchList">刷新</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="code" label="邀请码" min-width="240" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status]?.type || 'info'" size="small">
            {{ statusMap[row.status]?.text || row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="expiresAt" label="过期时间" width="180">
        <template #default="{ row }">
          {{ row.expiresAt || '永不过期' }}
        </template>
      </el-table-column>
      <el-table-column prop="usedBy" label="使用者" width="100">
        <template #default="{ row }">
          {{ row.usedBy || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button size="small" text type="primary" @click="handleCopy(row.code)">复制</el-button>
          <el-button v-if="row.status === 0" size="small" text type="danger" @click="handleRevoke(row.id)">
            作废
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      v-model:current-page="query.pageNum"
      v-model:page-size="query.pageSize"
      :total="total"
      :page-sizes="[10, 20, 30]"
      layout="total, sizes, prev, pager, next"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <el-dialog v-model="dialogVisible" title="生成邀请码" width="420px" :close-on-click-modal="false">
      <el-form @submit.prevent="handleGenerate">
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="expiresAt"
            type="datetime"
            placeholder="不选则永不过期"
            value-format="YYYY-MM-DDTHH:mm:ss"
            :shortcuts="expireShortcuts"
            style="width: 100%"
          />
        </el-form-item>
        <div class="dialog-tip">不设置过期时间则邀请码永久有效</div>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="generateLoading" @click="handleGenerate">确认生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.invite-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 20px;
    color: #2c3e50;
  }
}

.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.dialog-tip {
  font-size: 13px;
  color: #909399;
  margin-top: -8px;
}
</style>
