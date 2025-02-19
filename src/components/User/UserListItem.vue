<script setup lang="ts">
import { usePostStore, useUserStore } from "@/store";
import { getShortFIO } from "@/utils/utils";
import { computed } from "vue";

const props = defineProps<{ userId: string }>();

const userStore = useUserStore();
const postStore = usePostStore();

const user = computed(() => userStore.items.find((x) => x.id === props.userId));
const post = computed(() =>
  postStore.items.find((x) => x.id === user.value?.postId)
);
</script>

<template>
  <div class="flex items-center justify-start gap-4">
    <div class="shrink-0">
      <VImg :image="user?.images?.[0]" class="w-8 h-8 rounded-full" />
    </div>
    <div class="flex flex-col truncate">
      <span class="text-sm/6 font-medium text-gray-950 dark:text-white">
        {{ getShortFIO(user?.name) }}
      </span>
      <span class="truncate text-sm/6 text-gray-500 dark:text-gray-400">
        <slot name="description">
          {{ post?.name }}
        </slot>
      </span>
    </div>
  </div>
</template>
