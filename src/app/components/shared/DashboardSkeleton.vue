<template>
  <div class="space-y-6 w-full animate-fade-in">
    <!-- Header Skeleton -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
      <div class="space-y-1.5">
        <BaseSkeleton width="220px" height="28px" />
        <BaseSkeleton width="180px" height="16px" />
      </div>
      <BaseSkeleton width="150px" height="40px" class="rounded-xl" />
    </div>

    <!-- Cards Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div class="flex justify-between items-center">
          <BaseSkeleton width="100px" height="14px" />
          <BaseSkeleton width="28px" height="28px" class="rounded-lg" />
        </div>
        <div class="space-y-1.5">
          <BaseSkeleton width="60px" height="28px" />
          <BaseSkeleton width="120px" height="12px" class="opacity-75" />
        </div>
      </div>
    </div>

    <!-- Chart and List Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Chart Skeleton -->
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-center">
          <BaseSkeleton width="140px" height="20px" />
          <BaseSkeleton width="110px" height="32px" class="rounded-lg" />
        </div>
        <BaseSkeleton width="100%" height="1px" class="bg-slate-100" />
        <BaseSkeleton width="100%" height="240px" class="rounded-xl" />
      </div>

      <!-- Side Activity/Recent Tickets Skeleton -->
      <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-center">
          <BaseSkeleton width="120px" height="20px" />
          <BaseSkeleton width="60px" height="16px" />
        </div>
        <BaseSkeleton width="100%" height="1px" class="bg-slate-100" />
        <div class="space-y-4">
          <div v-for="i in 4" :key="i" class="flex items-center gap-3">
            <BaseSkeleton width="40px" height="40px" class="rounded-full flex-shrink-0" />
            <div class="space-y-1.5 flex-1">
              <BaseSkeleton width="80%" height="14px" />
              <BaseSkeleton width="50%" height="12px" class="opacity-75" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseSkeleton from './BaseSkeleton.vue'
</script>
