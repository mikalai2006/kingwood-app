<script setup lang="ts">
import { usePostStore, useRoleStore, useUserStore } from "@/store";
import { computed } from "vue";
import UserInfoTag from "../User/UserInfoTag.vue";

const userStore = useUserStore();
const postStore = usePostStore();
const roleStore = useRoleStore();

const roles = computed(() =>
  roleStore.items
    .filter(
      (x) =>
        !["admin", "systemrole", "boss", "designer", "dir"].includes(x.code)
    )
    .map((x) => x.id)
);

const freeUsers = computed(() =>
  userStore.items.filter(
    (x) => !x.taskWorkers?.length && roles.value.includes(x.roleId)
  )
);
</script>

<template>
  <div class="bg-white dark:bg-g-800 p-4 rounded-lg min-w-60">
    <div class="text-p-600 dark:text-p-300 pb-4 text-base">
      {{ $t("info.freeUser") }}
    </div>
    <div v-for="user in freeUsers" :key="user.id">
      <UserInfoTag :user-id="user.id" showPost />
      <!-- {{ user.id }}-{{ user.name }} | {{ user.WorkHistorys?.length }} |
      {{ user.taskWorkers?.length }} -->
    </div>
  </div>
</template>
