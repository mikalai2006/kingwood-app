<script setup lang="ts">
import { iInfoCircle } from "@/utils/icons";

defineProps<{ title: string }>();
</script>

<template>
  <a-tooltip>
    <template #title>
      <slot name="title">
        <p class="leading-5">
          {{ title }}
        </p>
      </slot>
    </template>
    <slot name="icon">
      <VIcon
        :path="iInfoCircle"
        class="cursor-pointer ml-1 text-xl text-s-400 dark:text-g-400 dark:text-s-"
      />
    </slot>
  </a-tooltip>
</template>
