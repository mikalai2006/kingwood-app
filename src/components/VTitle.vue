<script setup lang="ts">
export interface IVTitle {
  text: string;
}
const props = defineProps<IVTitle>();
</script>

<template>
  <h1 class="mb-2 text-lg text-s-800 dark:text-g-200">
    {{ props.text }}
  </h1>
</template>

<style scoped></style>
