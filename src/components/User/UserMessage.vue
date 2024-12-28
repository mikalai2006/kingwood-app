<script setup lang="ts">
import { computed, ref } from "vue";
import { useAuthStore, useRoleStore, useUserStore } from "@/store";
import { getShortFIO } from "@/utils/utils";
import { MenuProps } from "ant-design-vue";
import { useRouter } from "vue-router";
import VIcon from "../UI/VIcon.vue";
import { iBell } from "@/utils/icons";

const userStore = useUserStore();
const authStore = useAuthStore();
const roleStore = useRoleStore();

const router = useRouter();

const user = computed(() =>
  userStore.items.find((x) => x.id === authStore.iam.id)
);

const role = computed(() =>
  roleStore.items.find((x) => x.id === authStore.iam.roleId)
);
</script>
<template>
  <div v-if="true" class="flex flex-row items-center gap-2 cursor-pointer">
    <div class="relative">
      <VIcon :path="iBell" class="text-2xl" />
      <div
        v-if="true"
        class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-[3px] border-s-900 dark:border-g-950"
      ></div>
    </div>
  </div>
  <a-spin v-else />
</template>

<style scoped></style>
