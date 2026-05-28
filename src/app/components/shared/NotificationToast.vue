<script setup lang="ts">
import { useNotificationStore } from '@/stores/useNotificationStore'
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-vue-next'
import { computed } from 'vue'

const store = useNotificationStore()
const notification = computed(() => store.latestNotification)

const getIcon = (type: string) => {
  switch(type) {
    case 'success': return CheckCircle2
    case 'error': return XCircle
    case 'warning': return AlertCircle
    default: return Info
  }
}

const getColors = (type: string) => {
  switch(type) {
    case 'success': return 'bg-green-50 border-green-200 text-green-800'
    case 'error': return 'bg-red-50 border-red-200 text-red-800'
    case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    default: return 'bg-blue-50 border-blue-200 text-blue-800'
  }
}

const getProgressColor = (type: string) => {
  switch(type) {
    case 'success': return 'bg-green-500'
    case 'error': return 'bg-red-500'
    case 'warning': return 'bg-yellow-500'
    default: return 'bg-blue-500'
  }
}

const close = () => {
  store.clearToast()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-8 opacity-0 sm:translate-y-0 sm:translate-x-8"
    enter-to-class="transform translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100 sm:translate-x-0"
    leave-to-class="transform translate-y-8 opacity-0 sm:translate-y-0 sm:translate-x-8"
  >
    <div
      v-if="notification"
      :class="['fixed bottom-4 right-4 z-50 w-full max-w-sm overflow-hidden rounded-lg border shadow-lg', getColors(notification.type)]"
    >
      <div class="p-4 flex items-start gap-3">
        <component :is="getIcon(notification.type)" class="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <h3 class="font-semibold text-sm">{{ notification.title }}</h3>
          <p class="text-sm opacity-90 mt-1">{{ notification.message }}</p>
        </div>
        <button @click="close" class="opacity-50 hover:opacity-100 transition-opacity">
          <X class="w-4 h-4" />
        </button>
      </div>
      <!-- Loading Bar -->
      <div class="h-1 w-full bg-black/5">
        <div 
          :class="['h-full origin-left', getProgressColor(notification.type)]" 
          style="animation: shrink 5s linear forwards;"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes shrink {
  from { width: 100%; }
  to { width: 0%; }
}
</style>
