<script setup lang="ts">
import { useAuthStore } from "@/store";
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const authStore = useAuthStore();

const items = ref([
  "cms-dashboard",
  "cms-apperror",
  "cms-archive-order",
  "cms-archive-user",
  "cms-archive-notify",
  "cms-notify",
]);
</script>

<template>
  <div
    v-if="authStore.code === 'systemrole'"
    class="p-4 bg-sky-900 dark:bg-g-951"
  >
    <div class="rounded-lg flex flex-col gap-1">
      <template v-for="item in items" :key="item">
        <RouterLink
          :to="`/${item}`"
          class="flex items-center space-x-2 py-2 px-4 transition duration-200 hover:bg-s-300 dark:hover:bg-g-700 hover:text-black dark:hover:text-white group rounded-lg"
          :class="[
            route.name === item
              ? 'bg-white  dark:bg-g-700 text-black dark:text-white'
              : 'text-s-200 dark:text-g-400',
          ]"
        >
          <span>{{ $t(`cms.page.${item}`) }}</span>
        </RouterLink>
      </template>
    </div>
  </div>
</template>
