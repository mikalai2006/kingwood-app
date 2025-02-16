<template>
  <div>Home page</div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  router.push({
    name: "order",
  });
});
</script>

<style scoped></style>
