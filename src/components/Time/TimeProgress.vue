<script setup lang="ts">
const props = defineProps<{
  procent: number;
  active: boolean;
  height: number;
}>();
</script>

<template>
  <div class="flex flex-row items-center gap-1">
    <div
      class="flex-auto progress-bar-container overflow-hidden rounded-lg bg-black/15"
      :style="{ height: `${height}px` }"
    >
      <div
        class="transition-[width] duration-500 ease-in-out progress-bar-indicator"
        :style="{ width: `${procent}%` }"
        :class="{ 'progress-active': active }"
      ></div>
    </div>
    <div>{{ procent }}%</div>
  </div>
</template>

<style scoped>
.progress-bar-container {
  position: relative;
}

.progress-bar-indicator {
  height: 100%;
  -webkit-mask: linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0);
}
.progress-bar-indicator::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(
    to right,
    #87d068 40%,
    #ff6900 90%,
    #fb2c36
  );
}
/* .progress-bar-indicator-red-bg::before {
  background-image: linear-gradient(
    to right,
    #fff 40%,
    #ff6900 90%,
    #fb2c36
  );
}
.progress-bar-indicator-default-bg::before {
  background-image: linear-gradient(
    to right,
    #05df72 40%,
    #ff6900 90%,
    #fb2c36
  );
} */
</style>
