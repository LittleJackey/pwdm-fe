<script setup lang="ts">
// 纯容器，无逻辑
</script>

<template>
  <el-main class="main-content">
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </el-main>
</template>

<style lang="scss" scoped>
.main-content {
  /* 背景色在 index.vue 已经设了，这里主要处理内边距 */
  padding: 20px;
  overflow-x: hidden;
}

/* 简单的过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
