<script setup lang="ts">
import LayoutAside from '@/components/LayoutAside.vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import LayoutMain from '@/components/LayoutMain.vue'
import LayoutFooter from '@/components/LayoutFooter.vue'
import { ref } from 'vue'

// 定义折叠状态
const isCollapse = ref(false)

// 切换方法
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<template>
  <el-container class="layout-container">
    <LayoutAside :is-collapse="isCollapse" />
    <el-container class="is-vertical">
      <LayoutHeader :is-collapse="isCollapse" @toggle="toggleCollapse" />
      <LayoutMain />
      <LayoutFooter />
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  height: 100vh; /* 强制占满视口高度 */
  width: 100vw;
  background-color: #f5f7fa; /* 全局背景色设为淡灰 */
}
.is-vertical {
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
