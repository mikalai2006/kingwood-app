<script setup lang="ts">
import { usePostStore, useRoleStore, useUserStore } from "@/store";
import { computed } from "vue";

const userStore = useUserStore();
const postStore = usePostStore();
const roleStore = useRoleStore();

const roles = computed(() =>
  roleStore.items.filter((x) => x.code === "user").map((x) => x.id)
);

const freeUsers = computed(() =>
  userStore.items.filter(
    (x) => !x.WorkHistorys?.length && roles.value.includes(x.roleId)
  )
);
</script>

<template>
  <div>
    <div v-for="user in freeUsers" :key="user.id">
      {{ user.name }} | {{ user.WorkHistorys?.length }}
    </div>
  </div>
</template>
