<script setup lang="ts">
import { IImage } from "@/api/image/types";
import { computed, ref } from "vue";

const props = defineProps<{ image?: IImage; src?: string; one?: string }>();

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
  <a-image class="object-cover" :src="srcAttr" :preview="{ src: srcPreview }" />
  <!-- <div style="display: none">
    <a-image-preview-group :preview="{ visible, onVisibleChange: (vis: any) => (visible = vis) }">
      <a-image
        src="https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp"
      />
      <a-image
        src="https://gw.alipayobjects.com/zos/antfincdn/cV16ZqzMjW/photo-1473091540282-9b846e7965e3.webp"
      />
      <a-image
        src="https://gw.alipayobjects.com/zos/antfincdn/x43I27A55%26/photo-1438109491414-7198515b166b.webp"
      />
    </a-image-preview-group>
  </div> -->
</template>
