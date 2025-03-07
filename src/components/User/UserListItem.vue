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
      <VImg :image="user?.images?.[0]" class="w-10 h-10 rounded-full" />
    </div>
    <div class="flex flex-col truncate">
      <span class="text-sm/6 font-medium text-s-950 dark:text-g-200">
        {{ getShortFIO(user?.name) }}
      </span>
      <span class="truncate text-sm/6 text-g-300 dark:text-g-500">
        <slot name="description">
          {{ post?.name }}
        </slot>
      </span>
    </div>
  </div>
</template>
