<script setup lang="ts">
import { getAnalytic } from "@/api/analytic";
import { IAnalytic } from "@/api/analytic/types";
import { onMounted, ref } from "vue";

const analytic = ref<IAnalytic | null>(null);

onMounted(async () => {
  await getAnalytic().then((r) => {
    analytic.value = r;
  });
});
</script>

<template>
  <div class="p-4 bg-white dark:bg-g-800 rounded-lg">
    <div class="text-s-900 dark:text-g-400 pb-2">
      {{ $t("analytic.title.active") }}
    </div>
    <div
      v-if="analytic"
      v-for="key in Object.keys(analytic.active)"
      :key="key"
      class="flex items-center gap-2"
    >
      <div class="text-sm text-s-500 dark:text-g-300">
        {{ $t(`analytic.${key}`) }}:
      </div>
      <div
        class="flex-auto border-b border-dashed border-s-200 dark:border-g-500"
      ></div>
      <div class="text-base text-p-500 dark:text-p-300 font-bold">
        {{ analytic.active[key] }}
      </div>
    </div>
  </div>
</template>
