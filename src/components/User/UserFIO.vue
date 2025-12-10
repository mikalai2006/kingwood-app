<script setup lang="ts">
import { useUserStore } from "@/store";
import { getShortFIO } from "@/utils/utils";
import { computed } from "vue";

const props = defineProps<{
  userId: string;
}>();

const userStore = useUserStore();

const user = computed(() => userStore.items.find((x) => x.id == props.userId));
</script>

<template>
  <p class="text-nowrap">
    {{ getShortFIO(user?.name) }}
  </p>
</template>
