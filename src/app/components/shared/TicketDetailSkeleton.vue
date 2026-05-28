<template>
  <div class="max-w-7xl mx-auto space-y-6 w-full animate-fade-in">
    <!-- Breadcrumb & Actions Back Link -->
    <div class="flex items-center gap-2">
      <BaseSkeleton width="100px" height="20px" />
      <span class="text-slate-300">/</span>
      <BaseSkeleton width="80px" height="20px" />
    </div>

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <BaseSkeleton width="180px" height="32px" />
          <BaseSkeleton width="80px" height="24px" class="rounded-full" />
        </div>
        <div class="flex flex-wrap gap-x-4 gap-y-2">
          <BaseSkeleton width="150px" height="16px" />
          <BaseSkeleton width="120px" height="16px" />
        </div>
      </div>
      <div class="flex gap-2">
        <BaseSkeleton width="110px" height="40px" class="rounded-xl" />
        <BaseSkeleton width="140px" height="40px" class="rounded-xl" />
      </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Details & Audit Log -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Main Description Card -->
        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div class="flex justify-between items-center">
            <BaseSkeleton width="150px" height="20px" />
            <BaseSkeleton width="100px" height="20px" />
          </div>
          <BaseSkeleton width="100%" height="1px" class="bg-slate-100" />
          <div class="space-y-2">
            <BaseSkeleton width="100%" height="16px" />
            <BaseSkeleton width="95%" height="16px" />
            <BaseSkeleton width="70%" height="16px" />
          </div>
          <div class="pt-4 flex gap-4">
            <div class="space-y-1">
              <BaseSkeleton width="80px" height="12px" />
              <BaseSkeleton width="120px" height="20px" />
            </div>
            <div class="space-y-1">
              <BaseSkeleton width="80px" height="12px" />
              <BaseSkeleton width="120px" height="20px" />
            </div>
          </div>
        </div>

        <!-- Comments & Logs section -->
        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <BaseSkeleton width="160px" height="24px" />
          <BaseSkeleton width="100%" height="1px" class="bg-slate-100" />
          <div class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex gap-3">
              <BaseSkeleton width="40px" height="40px" class="rounded-full flex-shrink-0" />
              <div class="space-y-1.5 flex-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                <div class="flex justify-between">
                  <BaseSkeleton width="120px" height="16px" />
                  <BaseSkeleton width="70px" height="12px" />
                </div>
                <BaseSkeleton width="85%" height="14px" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Sidebar (Requester, Assignment, SLA Timeline) -->
      <div class="space-y-6">
        <!-- Requester Info -->
        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <BaseSkeleton width="120px" height="20px" />
          <BaseSkeleton width="100%" height="1px" class="bg-slate-100" />
          <div class="flex items-center gap-3">
            <BaseSkeleton width="48px" height="48px" class="rounded-full" />
            <div class="space-y-1.5">
              <BaseSkeleton width="130px" height="16px" />
              <BaseSkeleton width="90px" height="12px" />
            </div>
          </div>
        </div>

        <!-- Assignment Info -->
        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <BaseSkeleton width="150px" height="20px" />
          <BaseSkeleton width="100%" height="1px" class="bg-slate-100" />
          <div class="flex items-center gap-3">
            <BaseSkeleton width="48px" height="48px" class="rounded-full" />
            <div class="space-y-1.5">
              <BaseSkeleton width="140px" height="16px" />
              <BaseSkeleton width="100px" height="12px" />
            </div>
          </div>
        </div>

        <!-- Progress SLA Timeline -->
        <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <BaseSkeleton width="140px" height="20px" />
          <BaseSkeleton width="100%" height="1px" class="bg-slate-100" />
          <div class="space-y-6 pl-4 border-l-2 border-slate-100 dark:border-slate-800 relative">
            <div v-for="i in 4" :key="i" class="relative">
              <div class="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-slate-200 dark:border-slate-900"></div>
              <div class="space-y-1">
                <BaseSkeleton width="90px" height="16px" />
                <BaseSkeleton width="130px" height="12px" class="opacity-75" />
              </div>
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
