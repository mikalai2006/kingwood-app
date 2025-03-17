<script setup lang="ts">
import WidgetFreeUser from "@/components/Widget/WidgetFreeUser.vue";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  router.push({
    name: "order",
  });
});
</script>

<template>
  <div>Home page</div>
  <WidgetFreeUser />
</template>
