<script setup lang="ts">
import { ref, useAttrs } from 'vue';

const attrs = useAttrs();

const ERROR_IMG_SRC = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';

const didError = ref(false);

const handleError = () => {
  didError.value = true;
};
</script>

<template>
  <div v-if="didError" :class="['inline-block bg-gray-100 text-center align-middle', attrs.class]" :style="attrs.style as any">
    <div class="flex items-center justify-center w-full h-full text-gray-400 p-2">
      <img :src="ERROR_IMG_SRC" alt="Error loading image" v-bind="attrs" />
    </div>
  </div>
  <img v-else v-bind="attrs" @error="handleError" />
</template>
