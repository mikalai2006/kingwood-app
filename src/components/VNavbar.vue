<script setup lang="ts">
import { useAuthStore } from "@/store";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const authStore = useAuthStore();

const menuItems = computed(() =>
  [
    // "auth",
    // "role",
    // "post",
    "user",
    // "operation",
    // "object",
    "order",
    // "montaj",
    "montajList",
    // "task_status",
  ].filter((x) => authStore.roles.includes(`${x}-list`))
);
</script>
<template>
  <nav class="p-4 space-y-1">
    <!-- {{ JSON.stringify(route.name) }} -->
    <template v-for="item in menuItems" :key="item">
      <RouterLink
        v-if="authStore.roles.includes(`${item}-list`)"
        :to="`/${item}`"
        class="flex items-center space-x-2 py-2 px-4 transition duration-200 hover:bg-s-300 dark:hover:bg-g-700 hover:text-black dark:hover:text-white group rounded-lg"
        :class="[
          route.name === item
            ? 'bg-s-300  dark:bg-g-700 text-black dark:text-white'
            : 'text-s-200 dark:text-g-400',
        ]"
      >
        <!-- <span
        class="w-4 h-4 flex-shrink-0 border border-gray-600 rounded group-hover:border-gray-400 transition duration-200"
      ></span> -->
        <span>{{ $t(`page.${item}.title`) }}</span>
        <!-- <span
        v-if="route.name === item"
        class="w-4 h-4 rotate-45 bg-s-200 absolute -right-2 z-50"
      ></span> -->
      </RouterLink>
    </template>
  </nav>
</template>
