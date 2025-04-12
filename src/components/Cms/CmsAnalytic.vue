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
  <div class="p-4">
    <div
      v-if="analytic"
      v-for="key in Object.keys(analytic.active)"
      :key="key"
      class="flex items-center gap-2"
    >
      <div>
        {{ $t(`analytic.${key}`) }}
      </div>
      <div>
        {{ analytic.active[key] }}
      </div>
    </div>
  </div>
  <div class="p-4">
    <div
      v-if="analytic"
      v-for="key in Object.keys(analytic.archive)"
      :key="key"
      class="flex items-center gap-2"
    >
      <div>
        {{ $t(`analytic.${key}`) }}
      </div>
      <div>
        {{ analytic.archive[key] }}
      </div>
    </div>
  </div>
</template>
