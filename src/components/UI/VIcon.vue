<script setup lang="ts">
const props = defineProps<{ path: string }>();
</script>
<template>
  <svg
    class="fill-current"
    width="1em"
    height="1em"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
  >
    <path :d="props.path"></path>
  </svg>
</template>

<style scoped></style>
