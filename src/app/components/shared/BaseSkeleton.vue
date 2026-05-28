<template>
  <div
    :class="[
      'bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md',
      shimmer ? 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent' : '',
      customClass
    ]"
    :style="style"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    width?: string
    height?: string
    circle?: boolean
    shimmer?: boolean
    customClass?: string
  }>(),
  {
    shimmer: true,
    customClass: ''
  }
)

const style = computed(() => {
  const styles: Record<string, string> = {}
  if (props.width) styles.width = props.width
  if (props.height) styles.height = props.height
  if (props.circle) styles.borderRadius = '50%'
  return styles
})
</script>

<style scoped>
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
