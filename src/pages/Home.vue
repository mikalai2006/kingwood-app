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
  <div class="p-6">
    <WidgetFreeUser />
  </div>
</template>
