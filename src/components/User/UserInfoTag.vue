<script setup lang="ts">
import { computed } from "vue";
import { usePostStore, useRoleStore, useUserStore } from "@/store";
import { getShortFIO } from "@/utils/utils";
import { useRouter } from "vue-router";

const props = defineProps<{
  userId: string;
  showRole?: boolean;
  showPost?: boolean;
}>();

const userStore = useUserStore();
const roleStore = useRoleStore();
const postStore = usePostStore();

const router = useRouter();

const user = computed(() => userStore.items.find((x) => x.id === props.userId));

const role = computed(() =>
  roleStore.items.find((x) => x.id === user.value?.roleId)
);
const post = computed(() =>
  postStore.items.find((x) => x.id === user.value?.postId)
);
</script>

<template>
  <!-- <a-tooltip>
    <template #title>
      <div class="font-bold leading-4">
        {{ getShortFIO(user?.name) }}
        <span
          class="block font-normal leading-3 text-xs text-s-400 dark:text-g-300"
        >
          {{ role?.name }}
        </span>
      </div>
    </template> -->
  <div class="flex flex-row items-center gap-2">
    <div class="relative shrink-0">
      <VImg :image="user?.images?.[0]" class="w-10 h-10 rounded-md" />
      <div
        v-if="user?.online"
        class="absolute bottom-1 -right-2 w-3 h-3 rounded-full bg-green-500 border-[3px] border-white dark:border-g-900"
      ></div>
    </div>

    <div class="">
      <span>
        {{ getShortFIO(user?.name) }}
      </span>
      <span
        class="block font-normal leading-3 text-xs text-s-400 dark:text-g-300"
      >
        <template v-if="showRole">
          {{ role?.name }}
        </template>
        <template v-if="showPost">
          {{ post?.name }}
        </template>
      </span>
    </div>
  </div>
  <!-- </a-tooltip> -->
</template>

<style scoped></style>
