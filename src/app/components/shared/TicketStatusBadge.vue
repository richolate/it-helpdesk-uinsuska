<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  status: 'In Progress' | 'Resolved' | 'Pending' | 'Closed' | 'Open' | string
}>();

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'resolved':
    case 'closed':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};
</script>

<template>
  <span :class="`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`">
    {{ status }}
  </span>
</template>
