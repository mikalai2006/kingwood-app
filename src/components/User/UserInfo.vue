<script setup lang="ts">
import { computed } from "vue";
import { useRoleStore, useUserStore } from "@/store";
import { getShortFIO } from "@/utils/utils";

const userStore = useUserStore();
const roleStore = useRoleStore();

const props = defineProps<{
  userId: string;
}>();

const user = computed(() =>
  userStore.items.find((x) => x.id === props?.userId)
);

const role = computed(() =>
  roleStore.items.find((x) => x.id === user.value?.roleId)
);
</script>
<template>
  <div class="flex flex-row items-center gap-2 cursor-pointer">
    <div class="relative shrink-0 grow-0">
      <VImg :image="user?.images?.[0]" class="w-8 h-8 rounded-full" />
      <div
        v-if="user?.online"
        class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-s-50 dark:border-g-800"
      ></div>
    </div>
    <div class="font-bold leading-4">
      {{ getShortFIO(user?.name) }}
      <span
        class="block font-normal leading-3 text-xs text-s-400 dark:text-g-300"
      >
        {{ role?.name }}
      </span>
    </div>
  </div>
</template>
