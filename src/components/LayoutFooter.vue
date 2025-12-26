<script setup lang="ts">
import { computed } from 'vue'
const currentYear = computed(() => new Date().getFullYear())
</script>

<template>
  <el-footer class="footer">
    <span>© {{ currentYear }} sukyz-Password Manager</span>
  </el-footer>
</template>

<style lang="scss" scoped>
.footer {
  height: 40px; /* 调低高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary); /* 使用次级文本颜色 */
  font-size: 12px;
  background-color: transparent; /* 透明背景，透出 index 的淡灰底色 */
}
</style>
