<template>
  <div class="space-y-4 w-full">
    <!-- Header Controls Skeleton -->
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
      <div class="flex flex-wrap gap-2 w-full sm:w-auto">
        <BaseSkeleton width="180px" height="40px" />
        <BaseSkeleton width="120px" height="40px" />
        <BaseSkeleton width="120px" height="40px" />
      </div>
      <BaseSkeleton width="140px" height="40px" class="w-full sm:w-auto" />
    </div>

    <!-- Table Skeleton -->
    <div class="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
      <!-- Table Header Placeholder -->
      <div class="grid grid-cols-6 gap-4 p-4 border-b border-slate-100 bg-slate-50 dark:bg-slate-800/50">
        <BaseSkeleton width="80px" height="16px" />
        <BaseSkeleton width="150px" height="16px" />
        <BaseSkeleton width="100px" height="16px" />
        <BaseSkeleton width="85px" height="16px" />
        <BaseSkeleton width="70px" height="16px" />
        <BaseSkeleton width="80px" height="16px" class="justify-self-end" />
      </div>

      <!-- Table Rows Placeholders -->
      <div class="divide-y divide-slate-100 dark:divide-slate-800">
        <div v-for="i in rows" :key="i" class="grid grid-cols-6 gap-4 p-5 items-center hover:bg-slate-50/50">
          <BaseSkeleton width="60px" height="16px" />
          <div class="space-y-1.5">
            <BaseSkeleton width="85%" height="16px" />
            <BaseSkeleton width="50%" height="12px" class="opacity-75" />
          </div>
          <BaseSkeleton width="90px" height="24px" class="rounded-full" />
          <BaseSkeleton width="100px" height="24px" class="rounded-full" />
          <BaseSkeleton width="70px" height="16px" />
          <div class="justify-self-end flex gap-2">
            <BaseSkeleton width="32px" height="32px" class="rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseSkeleton from './BaseSkeleton.vue'

withDefaults(
  defineProps<{
    rows?: number
  }>(),
  {
    rows: 5
  }
)
</script>
