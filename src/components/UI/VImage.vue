<script setup lang="ts">
import { IImage } from "@/api/image/types";
import { computed, ref } from "vue";

const props = defineProps<{ image?: IImage; src?: string; one?: string }>();

console.log("dev=", import.meta);

const srcAttr = computed(() => {
  if (props.image) {
    return `${import.meta.env.VITE_HOSTIMAGE}/images/${props.image.service}/${
      props.image.serviceId
    }/xs-${props.image.path}${props.image.ext}`;
  } else if (props.one) {
    return `${import.meta.env.VITE_HOSTIMAGE}/images/${props.one}`;
  } else if (props.src) {
    return props.src;
  } else {
    return "./placeholder.png";
  }
});

const srcPreview = computed(() => {
  if (props.image) {
    return `${import.meta.env.VITE_HOSTIMAGE}/images/${props.image.service}/${
      props.image.serviceId
    }/${props.image.path}${props.image.ext}`;
  } else if (props.one) {
    return `${import.meta.env.VITE_HOSTIMAGE}/images/${props.one}`;
  } else if (props.src) {
    return props.src;
  } else {
    return "./placeholder.png";
  }
});

const visible = ref(false);
</script>

<template>
  <!-- <img class="h-8 w-8 rounded-full" :src="srcAttr" /> -->
  <a-image class="" :src="srcAttr" :preview="{ src: srcPreview }" />
  <!-- <div style="display: none">
    <a-image-preview-group
      :preview="{ visible, onVisibleChange: (vis: any) => (visible = vis) }"
    >
      <a-image :src="srcPreview" />
    </a-image-preview-group>
  </div> -->
</template>
