<script setup lang="ts">
import { IImage } from "@/api/image/types";
import { computed } from "vue";

const props = defineProps<{ image?: IImage; src?: string }>();

const srcAttr = computed(() => {
  if (props.image) {
    return `${import.meta.env.VITE_HOSTIMAGE}/images/${props.image.service}/${
      props.image.serviceId
    }/${props.image.path}${props.image.ext}`;
  } else if (props.src) {
    return props.src;
  } else {
    return "./placeholder.png";
  }
});
</script>

<template>
  <img class="h-8 w-8 rounded-full" :src="srcAttr" />
</template>
