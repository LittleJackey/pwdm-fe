<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Refresh,
  TrendCharts,
  CircleCheck,
  User,
  CircleClose,
  CopyDocument,
  InfoFilled,
  Clock
} from '@element-plus/icons-vue'
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

const stats = reactive({ total: 0, unused: 0, used: 0, revoked: 0 })

const statCards = computed(() => [
  { key: 'total', label: '总计', value: stats.total, icon: TrendCharts, bg: 'rgba(59,130,246,0.12)', color: '#2563eb' },
  {
    key: 'unused',
    label: '未使用',
    value: stats.unused,
    icon: CircleCheck,
    bg: 'rgba(34,197,94,0.12)',
    color: '#16a34a'
  },
  { key: 'used', label: '已使用', value: stats.used, icon: User, bg: 'rgba(99,102,241,0.12)', color: '#4f46e5' },
  {
    key: 'revoked',
    label: '已作废/过期',
    value: stats.revoked,
    icon: CircleClose,
    bg: 'rgba(156,163,175,0.12)',
    color: '#6b7280'
  }
])

const dialogVisible = ref(false)
const generateLoading = ref(false)
const expiresTime = ref('')
const generatedCode = ref('')

const expireShortcuts = [
  {
    text: '1天后',
    value: () => {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      return d
    }
  },
  {
    text: '7天后',
    value: () => {
      const d = new Date()
      d.setDate(d.getDate() + 7)
      return d
    }
  },
  {
    text: '30天后',
    value: () => {
      const d = new Date()
      d.setDate(d.getDate() + 30)
      return d
    }
  },
  {
    text: '90天后',
    value: () => {
      const d = new Date()
      d.setDate(d.getDate() + 90)
      return d
    }
  }
]

const dateToValue = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const statusMap: Record<number, { text: string }> = {
  0: { text: '未使用' },
  1: { text: '已使用' },
  2: { text: '已过期' },
  3: { text: '已作废' }
}

const fetchStats = async () => {
  try {
    const base = { pageNum: 1, pageSize: 1, orderColumn: '', orderDirection: '' }
    const [allRes, unusedRes, usedRes, expiredRes, revokedRes] = await Promise.all([
      getInviteListApi({ ...base, status: undefined }),
      getInviteListApi({ ...base, status: 0 }),
      getInviteListApi({ ...base, status: 1 }),
      getInviteListApi({ ...base, status: 2 }),
      getInviteListApi({ ...base, status: 3 })
    ])
    stats.total = allRes.data.total
    stats.unused = unusedRes.data.total
    stats.used = usedRes.data.total
    stats.revoked = expiredRes.data.total + revokedRes.data.total
  } catch {
    /* stats are non-critical */
  }
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
  expiresTime.value = ''
  generatedCode.value = ''
  dialogVisible.value = true
}

const handleGenerate = async () => {
  generateLoading.value = true
  try {
    const res = await generateInviteApi({ expiresTime: expiresTime.value || undefined })
    const code = res.data
    await navigator.clipboard.writeText(code)
    ElMessage.success({ message: `邀请码已生成并复制: ${code}`, plain: true, duration: 5000 })
    generatedCode.value = code
    fetchList()
    fetchStats()
  } finally {
    generateLoading.value = false
  }
}

const closeGenerateDialog = () => {
  dialogVisible.value = false
  generatedCode.value = ''
  expiresTime.value = ''
}

const handleRevoke = async (row: InviteCodeVO) => {
  try {
    await ElMessageBox.confirm(`确认作废邀请码「${row.code}」吗？作废后该邀请码将无法再使用。`, '确认作废', {
      confirmButtonText: '确定作废',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await revokeInviteApi(row.id)
    ElMessage.success({ message: '已作废', plain: true })
    fetchList()
    fetchStats()
  } catch {
    // cancelled or error handled by interceptor
  }
}

const handleCopy = async (text: string) => {
  await navigator.clipboard.writeText(text)
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

onMounted(() => {
  fetchList()
  fetchStats()
})
</script>

<template>
  <div class="invite-page">
    <!-- Zone 1: Stats Cards -->
    <div class="stats-row">
      <div v-for="card in statCards" :key="card.key" class="stat-card">
        <div class="stat-icon" :style="{ background: card.bg }">
          <el-icon :style="{ color: card.color }"><component :is="card.icon" /></el-icon>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ card.value }}</span>
          <span class="stat-label">{{ card.label }}</span>
        </div>
      </div>
    </div>

    <!-- Zone 2: Filter Card -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-left">
          <el-select v-model="query.status" placeholder="状态筛选" clearable @change="fetchList" style="width: 140px">
            <el-option :value="0" label="未使用" />
            <el-option :value="1" label="已使用" />
            <el-option :value="2" label="已过期" />
            <el-option :value="3" label="已作废" />
          </el-select>
          <el-button :icon="Refresh" @click="fetchList">刷新</el-button>
        </div>
        <div class="filter-right">
          <el-button type="primary" :icon="Plus" @click="openGenerateDialog">生成邀请码</el-button>
        </div>
      </div>
    </div>

    <!-- Zone 3: Table Card -->
    <div class="table-card">
      <el-table :data="list" v-loading="loading" stripe>
        <el-table-column type="index" label="序号" min-width="70" />

        <el-table-column label="邀请码" min-width="260">
          <template #default="{ row }">
            <span class="code-cell">
              <el-tooltip content="点击复制邀请码" placement="top">
                <span class="code-text" @click="handleCopy(row.code)">{{ row.code }}</span>
              </el-tooltip>
              <el-button size="small" text class="code-copy-btn" :icon="CopyDocument" @click="handleCopy(row.code)" />
            </span>
          </template>
        </el-table-column>

        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <span class="status-cell">
              <span class="status-dot" :class="`status-dot--${row.status}`"></span>
              <span class="status-text" :class="`status-text--${row.status}`">
                {{ statusMap[row.status]?.text || row.status }}
              </span>
            </span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" min-width="170">
          <template #default="{ row }">
            <span class="time-text">{{ row.createTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="过期时间" min-width="170">
          <template #default="{ row }">
            <template v-if="row.expiresTime">
              <span class="time-text">{{ row.expiresTime }}</span>
            </template>
            <template v-else>
              <span class="never-expires">永不过期</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="使用者" min-width="200">
          <template #default="{ row }">
            <template v-if="row.usedByUsername">
              <div class="used-by-cell">
                <el-tooltip content="点击复制用户名" placement="top">
                  <span class="clickable-text" @click="handleCopy(row.usedByUsername!)">{{ row.usedByUsername }}</span>
                </el-tooltip>
                <span class="uid-sep">·</span>
                <el-tooltip :content="`uid: ${row.usedByUid!}`" placement="top">
                  <span class="clickable-text uid-text" @click="handleCopy(row.usedByUid!)">{{ row.usedByUid }}</span>
                </el-tooltip>
              </div>
            </template>
            <template v-else>
              <span class="not-used">-</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button size="small" class="btn-copy" :icon="CopyDocument" @click="handleCopy(row.code)"
                >复制</el-button
              >
              <el-button
                v-if="row.status === 0"
                size="small"
                class="btn-revoke"
                :icon="CircleClose"
                @click="handleRevoke(row)"
                >作废</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!loading && list.length === 0" class="empty-state">
        <el-empty description="暂无邀请码数据" />
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="query.pageNum"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[10, 20, 30]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- Zone 4: Generate Dialog -->
    <el-dialog v-model="dialogVisible" :close-on-click-modal="false" @close="closeGenerateDialog" width="480px">
      <template #header>
        <span class="dialog-title">生成邀请码</span>
      </template>

      <template v-if="!generatedCode">
        <div class="hint-banner">
          <el-icon class="hint-banner-icon"><InfoFilled /></el-icon>
          <span>邀请码用于新用户注册，每个邀请码只能使用一次</span>
        </div>

        <div class="duration-section">
          <div class="duration-label">
            <el-icon><Clock /></el-icon>
            <span>过期时间</span>
          </div>
          <div class="duration-chips">
            <button
              v-for="s in expireShortcuts"
              :key="s.text"
              class="chip"
              :class="{ active: expiresTime === dateToValue(s.value()) }"
              @click="expiresTime = dateToValue(s.value())"
            >
              {{ s.text }}
            </button>
            <button class="chip" :class="{ active: !expiresTime }" @click="expiresTime = ''">永久</button>
          </div>
          <div class="custom-date-row">
            <span class="custom-label">自定义时间</span>
            <el-date-picker
              v-model="expiresTime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DDTHH:mm:ss"
              style="flex: 1"
            />
          </div>
        </div>
      </template>

      <template v-else>
        <div class="result-section">
          <div class="result-icon">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="result-title">邀请码已生成</div>
          <div class="result-code-box">
            <code class="result-code">{{ generatedCode }}</code>
            <el-button class="btn-copy" :icon="CopyDocument" size="small" @click="handleCopy(generatedCode)"
              >复制</el-button
            >
          </div>
          <div class="result-meta">
            <el-icon><Clock /></el-icon>
            <span v-if="expiresTime">过期时间：{{ expiresTime }}</span>
            <span v-else>永不过期</span>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="dialog-footer">
          <template v-if="!generatedCode">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="generateLoading" @click="handleGenerate">确认生成</el-button>
          </template>
          <el-button v-else type="primary" @click="closeGenerateDialog">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.invite-page {
  background-color: #f7f8fa;
  min-height: 100%;
  padding: 20px;
}

// ── Stats Row ──
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  transition:
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.08),
      0 0 0 1px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .el-icon {
    font-size: 22px;
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

// ── Filter Card ──
.filter-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

// ── Table Card ──
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.03);
}

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

  .el-table__body tr {
    transition: background-color 0.15s;
  }
}

// ── Pagination ──
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f1f3;
  margin-top: 16px;
}

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

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

// ── Action Buttons ──
.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-copy {
  --el-button-border-color: #3b82f6;
  --el-button-text-color: #2563eb;
  --el-button-bg-color: rgba(59, 130, 246, 0.1);
  --el-button-hover-border-color: #2563eb;
  --el-button-hover-text-color: #1d4ed8;
  --el-button-hover-bg-color: rgba(59, 130, 246, 0.18);
  border-width: 1.5px;
  font-weight: 600;
}

.btn-revoke {
  --el-button-border-color: #f87171;
  --el-button-text-color: #dc2626;
  --el-button-bg-color: rgba(239, 68, 68, 0.1);
  --el-button-hover-border-color: #dc2626;
  --el-button-hover-text-color: #b91c1c;
  --el-button-hover-bg-color: rgba(239, 68, 68, 0.18);
  border-width: 1.5px;
  font-weight: 600;
}

// ── Invite Code Column ──
.code-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.code-text {
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', 'Fira Code', 'JetBrains Mono', 'Menlo', monospace;
  font-size: 13px;
  letter-spacing: 0.5px;
  cursor: pointer;
  border-bottom: 1.5px dashed #d1d5db;
  padding-bottom: 2px;
  transition:
    color 0.2s,
    border-color 0.2s;

  &:hover {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }
}

.code-copy-btn {
  opacity: 0;
  transition: opacity 0.2s;
  color: #9ca3af;
  margin-left: 4px;

  &:hover {
    color: #2563eb;
  }
}

:deep(.el-table__row:hover) .code-copy-btn {
  opacity: 1;
}

// ── Status Column ──
.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;

  &--0 {
    background-color: #22c55e;
  }
  &--1 {
    background-color: #3b82f6;
  }
  &--2 {
    background-color: #9ca3af;
  }
  &--3 {
    background-color: #ef4444;
  }
}

.status-text {
  font-size: 13px;
  font-weight: 500;

  &--0 {
    color: #15803d;
  }
  &--1 {
    color: #1d4ed8;
  }
  &--2 {
    color: #6b7280;
  }
  &--3 {
    color: #b91c1c;
  }
}

// ── Time Columns ──
.time-text {
  font-size: 13px;
  color: #4b5563;
  font-variant-numeric: tabular-nums;
}

.never-expires {
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
}

// ── Used-By Column ──
.used-by-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.clickable-text {
  cursor: pointer;
  border-bottom: 1.5px dashed #d1d5db;
  padding-bottom: 2px;
  transition:
    color 0.2s,
    border-color 0.2s;

  &:hover {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }
}

.uid-text {
  max-width: 140px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #909399;
}

.uid-sep {
  font-size: 12px;
  color: #c0c4cc;
}

.not-used {
  color: #c0c4cc;
}

// ── Empty State ──
.empty-state {
  padding: 60px 0;
}

// ── Generate Dialog ──
:deep(.el-dialog) {
  border-radius: 14px;

  .el-dialog__header {
    padding: 24px 28px 0;
  }

  .el-dialog__body {
    padding: 20px 28px 28px;
  }

  .el-dialog__footer {
    padding: 0 28px 24px;
  }
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// Hint banner (matching DecryptKeyDialog)
.hint-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-8);
  border-radius: 10px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.6;
}

.hint-banner-icon {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--el-color-primary);
  margin-top: 1px;
}

// Duration section
.duration-section {
  margin-bottom: 4px;
}

.duration-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;

  .el-icon {
    font-size: 15px;
    color: #6b7280;
  }
}

.duration-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.chip {
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  background: #f3f4f6;
  border: 1.5px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  line-height: 1.4;

  &:hover {
    background: #e5e7eb;
    color: #1f2937;
  }

  &.active {
    color: #2563eb;
    background: rgba(37, 99, 235, 0.1);
    border-color: rgba(37, 99, 235, 0.35);
  }
}

.custom-date-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-label {
  font-size: 13px;
  color: #9ca3af;
  flex-shrink: 0;
}

// Result section
.result-section {
  text-align: center;
  padding: 16px 0 8px;
}

.result-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.12);
  margin-bottom: 16px;

  .el-icon {
    font-size: 30px;
    color: #16a34a;
  }
}

.result-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.result-code-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 14px;
}

.result-code {
  flex: 1;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', 'Fira Code', 'JetBrains Mono', 'Menlo', monospace;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: 0.5px;
  word-break: break-all;
  text-align: left;
}

.result-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;

  .el-icon {
    font-size: 14px;
  }
}

:deep(.el-picker-panel__link-btn) {
  display: none;
}

// ── Responsive ──
@media (max-width: 900px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  .filter-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
