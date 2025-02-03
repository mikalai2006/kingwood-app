<script setup lang="ts">
import { computed } from "vue";

import { useAuthStore, useObjectStore } from "@/store";

const props = defineProps<{
  objectId: string;
}>();

const authStore = useAuthStore();
const objectStore = useObjectStore();

const object = computed(() =>
  objectStore.items.find((x) => x.id === props.objectId)
);
</script>

<template>
  <div>{{ object?.name }}</div>
</template>
