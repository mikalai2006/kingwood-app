<script setup lang="ts">
import { useOrderStore, useTaskStore, useTaskWorkerStore } from "@/store";
import { iCheckLg } from "@/utils/icons";
import { computed } from "vue";

const props = defineProps<{
  orderId: string;
}>();

const emits = defineEmits(["onCheckComplete"]);

const orderStore = useOrderStore();
const taskWorkerStore = useTaskWorkerStore();
const taskStore = useTaskStore();
const taskWorkers = computed(() =>
  taskWorkerStore.items.filter((x) => x.orderId == props.orderId)
);
const tasks = computed(() =>
  taskStore.items.filter((x) => x.orderId == props.orderId)
);
const order = computed(() =>
  orderStore.items.find((x) => x.id == props.orderId)
);

const isNoCompletedOrder = computed(
  () =>
    tasks.value?.filter((x) => !["finish", "autofinish"].includes(x.status))
      .length == 0 &&
    tasks.value.length > 0 &&
    order.value?.status != 200
);
</script>

<template>
  <a-tooltip placement="topRight" v-if="isNoCompletedOrder">
    <template #title>
      {{ $t("button.checkCompleteOrder") }}
    </template>
    <a-button
      class="bg-purple-500 text-white"
      @click="(e: Event) => {$emit('onCheckComplete', order); e.preventDefault(); e.stopPropagation()}"
    >
      <div class="flex items-center gap-2">
        <VIcon :path="iCheckLg" />
        <!-- {{ $t("button.checkComplete") }} -->
      </div>
    </a-button>
  </a-tooltip>
</template>
