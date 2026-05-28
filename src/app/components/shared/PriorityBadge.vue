<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowUp, Minus } from "lucide-vue-next";

const props = defineProps({
  priority: {
    type: String,
    required: true
  },
  showIcon: {
    type: Boolean,
    default: true
  }
});

const config = computed(() => {
  switch (props.priority) {
    case "High":
      return {
        color: "bg-red-100 text-red-700 border-red-200",
        icon: AlertCircle,
      };
    case "Medium":
      return {
        color: "bg-orange-100 text-orange-700 border-orange-200",
        icon: ArrowUp,
      };
    case "Low":
      return {
        color: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Minus,
      };
    default:
      return {
        color: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Minus,
      };
  }
});
</script>

<template>
  <Badge variant="outline" :class="[config.color, 'font-medium']">
    <span v-if="showIcon" class="mr-1">
      <component :is="config.icon" class="w-3 h-3" />
    </span>
    {{ priority }}
  </Badge>
</template>
