<script setup lang="ts">
import * as icons from "@/utils/icons";
import VIcon from "./VIcon.vue";

const model = defineModel();
</script>

<template>
  <div class="flex flex-row flex-wrap gap-1">
    <a-button
      v-for="(icon, index) in icons"
      :key="index.toString()"
      @click="model = icon"
    >
      <VIcon :path="icon" class="text-lg" />
    </a-button>
  </div>
</template>
