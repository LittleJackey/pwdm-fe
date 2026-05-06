<script setup lang="ts">
import { ref } from 'vue'

const value2 = ref('')

const shortcuts = [
  {
    text: 'Today',
    value: new Date()
  },
  {
    text: 'Yesterday',
    value: () => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return date
    }
  },
  {
    text: 'A week ago',
    value: () => {
      const date = new Date()
      date.setDate(date.getDate() - 7)
      return date
    }
  }
]
</script>

<template>
  <div class="home-page">
    <h1>首页</h1>
    <div class="block">
      <span class="demonstration">With shortcuts</span>
      <el-date-picker
        v-model="value2"
        type="datetime"
        placeholder="Select date and time"
        :shortcuts="shortcuts"
        show-now="false"
        show-confirm="true"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
