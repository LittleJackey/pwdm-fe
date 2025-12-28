<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { logoutApi } from '@/services/user'
import { ElMessage } from 'element-plus'

defineProps<{
  isCollapse: boolean
}>()
const emit = defineEmits(['toggle'])

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 生成面包屑数据
// 过滤掉没有 meta.title 的路由（比如重定向的父路由）
const breadcrumbs = computed(() => {
  return route.matched.filter((item) => item.meta && item.meta.title)
})

const handleLogout = async () => {
  await logoutApi()
  router.replace({ name: 'Login' })
  ElMessage.success({ message: '登出成功', plain: true })
}
const handleUserInfo = () =>
  router.push({
    name: 'UserInfo',
    query: { returnUrl: router.currentRoute.value.fullPath }
  })
</script>

<template>
  <el-header class="header">
    <div class="header-left">
      <el-icon class="collapse-btn" size="20" @click="emit('toggle')">
        <component :is="isCollapse ? Expand : Fold" />
      </el-icon>

      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
          <span v-if="index === breadcrumbs.length - 1" class="no-redirect">
            {{ item.meta.title }}
          </span>
          <a v-else @click.prevent="router.push(item.path)" class="redirect">
            {{ item.meta.title }}
          </a>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <el-dropdown>
        <span class="el-dropdown-link">
          {{ userStore.user?.username }}
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleUserInfo">个人中心</el-dropdown-item>
          </el-dropdown-menu>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<style lang="scss" scoped>
.header {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;

  .header-left {
    display: flex;
    align-items: center;

    .collapse-btn {
      cursor: pointer;
      color: var(--el-text-color-regular);
      margin-right: 20px; /* 给面包屑留出距离 */
      transition: color 0.3s;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    /* 面包屑样式微调 */
    .breadcrumb {
      /* 解决 flex 布局下文字可能垂直不居中的问题 */
      display: flex;
      align-items: center;

      /* 定义普通链接样式 */
      .redirect {
        color: var(--el-text-color-regular);
        font-weight: normal;
        cursor: pointer;

        &:hover {
          color: var(--el-color-primary);
        }
      }

      /* 定义当前页（最后一项）样式 */
      .no-redirect {
        color: #303133; /* 更深一点的黑色 */
        font-weight: 600; /* 加粗表示当前位置 */
        cursor: text;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    .el-dropdown-link {
      cursor: pointer;
      display: flex;
      align-items: center;
      color: var(--el-text-color-primary);
      outline: none;
    }
  }
}
</style>
