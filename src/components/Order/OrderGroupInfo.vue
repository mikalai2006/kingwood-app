<script setup lang="ts">
import { computed } from "vue";

import { useOrderStore } from "@/store";
import VIcon from "../UI/VIcon.vue";
import { getShortFIO, invertColor } from "@/utils/utils";
import { iCheckLg } from "@/utils/icons";

const props = defineProps<{
  orderId: string;
}>();

const orderStore = useOrderStore();

const order = computed(() => {
  return orderStore.items.find((x) => x.id === props.orderId);
});
</script>
<template>
  <div class="flex flex-col flex-wrap gap-1 items-center">
    <div>
      <div>
        <VIcon :path="iCheckLg" class="text-2xl" />
      </div>
      <div>
        {{ $t(`groupOperation.${order?.group}`) }}
      </div>
    </div>
  </div>
</template>

<style scoped></style>
