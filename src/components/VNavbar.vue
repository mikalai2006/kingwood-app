<script setup lang="ts">
import { useAuthStore } from "@/store";
import { computed, h, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import VIcon from "./UI/VIcon.vue";
import { iWraningTriangle } from "@/utils/icons";

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
    "financy",
    // "task_status",
  ].filter((x) => authStore.roles.includes(`${x}-list`))
);

// const state = reactive({
//   collapsed: false,
//   selectedKeys: ["1"],
//   openKeys: ["sub1"],
//   preOpenKeys: ["sub1"],
// });
// const items = reactive([
//   {
//     key: "1",
//     icon: () =>
//       h(VIcon, {
//         path: iWraningTriangle,
//         class: "flex-none text-2xl text-s-500 dark:text-g-400",
//       }),
//     label: "Option 1",
//     title: "Option 1",
//   },
//   {
//     key: "2",
//     icon: () =>
//       h(VIcon, {
//         path: iWraningTriangle,
//         class: "flex-none text-xl text-s-500 dark:text-g-400",
//       }),
//     label: "Option 2",
//     title: "Option 2",
//   },
//   {
//     key: "3",
//     icon: () =>
//       h(VIcon, {
//         path: iWraningTriangle,
//         class: "flex-none text-xl text-s-500 dark:text-g-400",
//       }),
//     label: "Option 3",
//     title: "Option 3",
//   },
//   {
//     key: "sub1",
//     icon: () =>
//       h(VIcon, {
//         path: iWraningTriangle,
//         class: "flex-none text-xl text-s-500 dark:text-g-400",
//       }),
//     label: "Navigation One",
//     title: "Navigation One",
//     children: [
//       {
//         key: "5",
//         label: "Option 5",
//         title: "Option 5",
//       },
//       {
//         key: "6",
//         label: "Option 6",
//         title: "Option 6",
//       },
//       {
//         key: "7",
//         label: "Option 7",
//         title: "Option 7",
//       },
//       {
//         key: "8",
//         label: "Option 8",
//         title: "Option 8",
//       },
//     ],
//   },
// ]);
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
            ? 'bg-white dark:bg-g-700 text-black dark:text-white'
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
        <!-- <span
          v-if="item == 'montajList'"
          class="bg-lime-600 px-1.5 rounded-md text-white"
        >
          тест
        </span> -->
      </RouterLink>
    </template>
  </nav>
  <!-- <a-menu
    v-model:openKeys="state.openKeys"
    v-model:selectedKeys="state.selectedKeys"
    mode="inline"
    theme="dark"
    :inline-collapsed="state.collapsed"
    :items="items"
  ></a-menu> -->
</template>
