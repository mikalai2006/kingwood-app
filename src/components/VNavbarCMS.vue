<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const menuItems = ref([
  // "auth",
  "role",
  "post",
  // "user",
  "operation",
  // "object",
  // "order",
  // "montajList",
  "taskStatus",
]);
</script>
<template>
  <nav class="p-4 space-y-1 bg-s-700 dark:bg-g-950">
    <div class="text-sm text-s-400 dark:text-g-300">
      {{ $t("page.cms.title") }}
    </div>
    <!-- {{ JSON.stringify(route.name) }} -->
    <RouterLink
      v-for="item in menuItems"
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
  </nav>
</template>
