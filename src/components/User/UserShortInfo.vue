<script setup lang="ts">
import { computed } from "vue";
import { useRoleStore, useUserStore } from "@/store";
import { getShortFIO } from "@/utils/utils";
import { useRouter } from "vue-router";

const props = defineProps<{
  userId: string;
}>();

const userStore = useUserStore();
const roleStore = useRoleStore();

const router = useRouter();

const user = computed(() => userStore.items.find((x) => x.id === props.userId));

const role = computed(() =>
  roleStore.items.find((x) => x.id === user.value?.roleId)
);
</script>

<template>
  <a-tooltip>
    <template #title>
      <div class="font-bold leading-4">
        {{ getShortFIO(user?.name) }}
        <span
          class="block font-normal leading-3 text-xs text-s-400 dark:text-g-300"
        >
          {{ role?.name }}
        </span>
      </div>
    </template>
    <div class="flex flex-row items-center gap-2">
      <div class="relative">
        <VImg :image="user?.images?.[0]" class="w-10 h-10 rounded-full" />
      </div>

      <!-- <div class="flex items-center px-2">
        <VIcon :path="iDotsHorizontal" class="self-center" />
      </div> -->
    </div>
  </a-tooltip>
</template>

<style scoped></style>
