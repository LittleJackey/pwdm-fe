<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Odometer, Lock } from '@element-plus/icons-vue'

defineProps<{
  isCollapse: boolean
}>()

const route = useRoute()

// 模拟菜单数据
const menuList = [
  { path: '/home', title: '首页', icon: Odometer },
  { path: '/pwdm', title: '密码管理', icon: Lock }
]
</script>

<template>
  <el-aside class="aside" :class="{ 'is-collapse': isCollapse }">
    <div class="logo">
      <img src="@/icons/ljic.png" alt="Logo" class="logo-img" />
      <h1 class="logo-text">Pwd Manager</h1>
    </div>

    <el-menu
      :default-active="route.path"
      class="aside-menu"
      router
      unique-opened
      :collapse="isCollapse"
      :collapse-transition="false"
    >
      <el-menu-item v-for="item in menuList" :key="item.path" :index="item.path">
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>
          <span>{{ item.title }}</span>
        </template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<style lang="scss" scoped>
/* 定义变量方便调整 */
$aside-width: 220px;
$aside-width-collapsed: 64px;
$transition-duration: 0.35s;
/* 丝滑的核心：贝塞尔曲线 */
$transition-timing: cubic-bezier(0.2, 0, 0, 1);

.aside {
  width: $aside-width;
  background-color: #ffffff;
  height: 100%;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 关键：裁剪溢出内容 */

  /* 关键：应用过渡动画 */
  transition: width $transition-duration $transition-timing;

  /* 折叠状态下的样式覆盖 */
  &.is-collapse {
    width: $aside-width-collapsed;

    .logo {
      .logo-img {
        /* 使用 margin 把图片挤向右边 */
        margin-left: 11px; /* 你可以调整这个数值，数值越大越靠右 */
      }
      .logo-text {
        opacity: 0;
        transform: translateX(-10px); /* 让文字往左稍微飘一点消失 */
        width: 0; /* 配合 opacity 彻底隐藏占位 */
      }
    }
  }

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 10px;
    flex-shrink: 0;
    /* 即使折叠，Logo图片区域也要保持居中 */
    overflow: hidden;

    .logo-img {
      width: 28px;
      height: 28px;
      flex-shrink: 0; /* 防止图片被压缩 */
    }

    .logo-text {
      margin-left: 10px;
      font-size: 16px;
      font-weight: 600;
      color: #333;
      white-space: nowrap; /* 核心：防止文字换行 */

      /* 文字的过渡动画 */
      opacity: 1;
      width: 100px; /* 给一个固定宽度或 auto */
      transform: translateX(0);
      transition:
        opacity $transition-duration $transition-timing,
        transform $transition-duration $transition-timing,
        width $transition-duration $transition-timing;
    }
  }

  .aside-menu {
    border-right: none;
    flex: 1;
    width: 100%;

    /* 修复 Element Plus 菜单折叠时的微小抖动 */
    :deep(.el-menu-item) {
      white-space: nowrap;
    }
  }
}
</style>
