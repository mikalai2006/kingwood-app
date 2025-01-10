<script setup lang="ts">
import { iChevronRight } from "@/utils/icons";
import VIcon from "../UI/VIcon.vue";

defineProps<{ title: string }>();
</script>

<template>
  <div
    class="h-12 flex flex-row gap-0 items-center pb-1 border-b border-s-100 dark:border-g-700"
  >
    <slot name="back">
      <a-tooltip>
        <template #title>
          {{ $t("button.goBack") }}
        </template>
        <a-button
          type="link"
          class="flex items-center gap-2"
          @click="
            () => {
              $router.back();
            }
          "
        >
          <VIcon :path="iChevronRight" class="rotate-180" />
        </a-button>
      </a-tooltip>
    </slot>
    <div>
      <h2 class="text-lg font-medium">
        {{ title }}
      </h2>
    </div>
  </div>
</template>
