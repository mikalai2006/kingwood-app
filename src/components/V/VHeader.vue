<script setup lang="ts">
import { iChevronRight } from "@/utils/icons";
import VIcon from "../UI/VIcon.vue";

defineProps<{ title: string }>();
</script>

<template>
  <div class="flex flex-row gap-4 items-center pb-1 mt-4">
    <!-- border-b border-black/5 dark:border-white/5 -->
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
    <div class="flex-auto">
      <h2 class="text-lg font-medium">
        {{ title }}
      </h2>
    </div>
    <div>
      <slot name="header"></slot>
    </div>
  </div>
</template>
