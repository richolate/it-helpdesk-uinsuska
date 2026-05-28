<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-vue-next";

const props = defineProps({
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    default: 'Open'
  }
});

const now = ref(new Date());

const isDone = computed(() => props.status === 'Resolved' || props.status === 'Closed');
const isBreached = computed(() => now.value > props.dueDate && !isDone.value);

const timeRemaining = computed(() => {
  if (isDone.value) return 'Done';
  
  const diff = Math.abs(props.dueDate.getTime() - now.value.getTime());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
});

let interval: number;

onMounted(() => {
  if (!isDone.value) {
    interval = setInterval(() => {
      now.value = new Date();
    }, 60000); // Update every minute
  }
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<template>
  <Badge
    variant="outline"
    :class="[
      'flex items-center gap-1 w-fit font-medium',
      isDone
        ? 'bg-green-100 text-green-700 border-green-200'
        : isBreached 
          ? 'bg-red-100 text-red-700 border-red-200' 
          : 'bg-orange-50 text-orange-700 border-orange-200'
    ]"
  >
    <template v-if="isDone">
      <CheckCircle2 class="w-3 h-3" />
      <span>Done</span>
    </template>
    <template v-else-if="isBreached">
      <AlertTriangle class="w-3 h-3" />
      <span>Breached by {{ timeRemaining }}</span>
    </template>
    <template v-else>
      <Clock class="w-3 h-3" />
      <span>{{ timeRemaining }} left</span>
    </template>
  </Badge>
</template>
